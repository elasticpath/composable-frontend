# @epcc-sdk/visitor

Visitor id for Elastic Path storefronts. The package gives a shopper who consented a lasting visitor id in a first-party cookie, and builds the request headers that carry that id and the shopper's consent to Elastic Path Composable Commerce. It has no dependencies and uses only the Fetch API `Request`, so it runs in Node, edge runtimes and Workers.

The package version is below 1.0 until Elastic Path confirms the final header and cookie names.

This README is the whole contract. You can implement it from here without the package, in any language: see [Other languages](#other-languages-raw-http).

## Contents

- [The contract in one page](#the-contract-in-one-page)
- [Install](#install)
- [Use](#use)
- [Visitor states](#visitor-states)
- [The consent function](#the-consent-function)
- [The `ep_vsid` opt-in](#the-ep_vsid-opt-in)
- [Global Privacy Control](#global-privacy-control)
- [Headers](#headers)
- [The rules](#the-rules)
- [With the shopper SDK](#with-the-shopper-sdk)
- [With your own HTTP client](#with-your-own-http-client)
- [Next.js](#nextjs)
- [Express and Fastify](#express-and-fastify)
- [Other languages (raw HTTP)](#other-languages-raw-http)
- [Browser-only storefronts](#browser-only-storefronts)
- [Exports](#exports)

## The contract in one page

Two cookies, three request headers.

| Name                 | Where          | What it is                                                                                                                      |
| -------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `ep_vid`             | cookie         | The lasting visitor id. Set only when the shopper consented. First party, readable by browser code, lasts 365 days.             |
| `ep_vsid`            | cookie         | A session visitor id. Set only when you opt in, for a shopper who has not decided. HttpOnly, ends with the browser session.     |
| `EP-Visitor-Id`      | request header | The visitor id, sent on each Elastic Path Composable Commerce request.                                                          |
| `EP-Visitor-Consent` | request header | The purposes the shopper agreed to (`analytics`, `personalization`, comma-separated), or `none` for an id sent without consent. |
| `EP-Analytics`       | request header | `off` keeps one request out of analytics, whatever the consent. For staff, tests, bots and design tools.                        |

The merchant owns the cookie banner and supplies the consent function, so the merchant's consent management platform (CMP) stays the single source of the shopper's choice.

## Install

```bash
npm install @epcc-sdk/visitor
```

## Use

You supply a consent function. It reads the request, for example your CMP cookie, and returns the purposes the shopper agreed to.

```ts
import { readCookie, resolveVisitor, visitorHeaders } from "@epcc-sdk/visitor"
import type { ConsentFunction } from "@epcc-sdk/visitor"

const consent: ConsentFunction = (request) =>
  readCookie(request, "my_cmp_consent") === "accepted"
    ? { state: "granted", purposes: ["analytics", "personalization"] }
    : { state: "none" }

export async function handle(request: Request): Promise<Response> {
  const { visitor, setCookies } = await resolveVisitor(request, { consent })
  const headers = visitorHeaders(visitor)

  const response = new Response("ok")
  for (const cookie of setCookies) response.headers.append("Set-Cookie", cookie)
  return response
}
```

`resolveVisitor` returns:

- `visitor`: `{ kind: "lasting", id, purposes }`, `{ kind: "session", id }`, `{ kind: "none" }` or `{ kind: "objected" }`.
- `setCookies`: raw `Set-Cookie` values to add to the response, to set or to clear a cookie. The list is empty when nothing changes, for example when `ep_vid` already holds a valid id, so most responses stay cacheable.

Call `resolveVisitor` once per incoming request, as early as you can (middleware), and use the returned `visitor` for every Elastic Path call that request makes, including the ones made while the response is built. The first response of a new visitor sets the cookie, but the browser has not sent it yet, so the id in `visitor` is the only copy your server calls can use.

A granted shopper gets one `ep_vid` cookie: `Path=/`, `Secure`, `SameSite=Lax`, readable by browser code, lasting 365 days from creation. The lifetime does not roll, so it adds `Set-Cookie` only on the response where the cookie changes. The id is 128 random bits written as 32 lowercase hex characters, and any other cookie value counts as absent and is replaced. The id is readable in the browser so your own tools can reuse it, for example PostHog `bootstrap.distinctID` or Algolia `setUserToken`. Only the lasting id (`ep_vid`) is meant for that; an id sent without consent is never a lasting id.

Both cookies are `Secure`. Browsers store them over HTTPS, and on `localhost`.

## Visitor states

A shopper is in one of four states on each request.

| State                                                       | Consent result                       | Visitor    | Headers sent                                      | Cookies                                                                |
| ----------------------------------------------------------- | ------------------------------------ | ---------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| Consented                                                   | `{ state: "granted", purposes }`     | `lasting`  | `EP-Visitor-Id`, `EP-Visitor-Consent: <purposes>` | Keeps a valid `ep_vid` or sets a new one. Clears `ep_vsid` if present. |
| No consent and no objection (the default)                   | `{ state: "none" }`                  | `none`     | none                                              | Clears `ep_vid` and `ep_vsid` if present.                              |
| No consent and no objection, merchant opted in to `ep_vsid` | `{ state: "none", sessionId: true }` | `session`  | `EP-Visitor-Id`, `EP-Visitor-Consent: none`       | Keeps a valid `ep_vsid` or sets a new one. Clears `ep_vid` if present. |
| Objection (Reject all, withdrawal, Global Privacy Control)  | `{ state: "objected" }`              | `objected` | none                                              | Clears `ep_vid` and `ep_vsid` if present.                              |

The default for a shopper who has not decided is `none`: server calls carry no visitor id, the same as Algolia. The store works fully in this state.

A new `ep_vid` is never linked to an earlier `ep_vsid`, and a new consent after an objection always makes a new id, because the objection cleared the old one.

`resolveVisitor` is stateless: it reads the cookies on the request and remembers nothing between requests. A new id after an objection therefore depends on at least one request in the objected state reaching `resolveVisitor`, so the cookie is cleared before consent returns. If a shopper can go from Accept to Reject all to Accept without any request passing through your middleware in between, the old `ep_vid` is still on the request and is kept. Make the middleware cover every route your consent management platform change can reach, including the request that follows the choice.

## The consent function

```ts
type Purpose = "analytics" | "personalization"

type ConsentResult =
  | { state: "granted"; purposes: Purpose[] }
  | { state: "none"; sessionId?: boolean }
  | { state: "objected" }

type ConsentFunction = (
  request: Request,
) => ConsentResult | Promise<ConsentResult>
```

- It receives the incoming `Request`, so it can read your CMP cookie and headers such as `Sec-GPC`. It can be async.
- `granted` needs at least one purpose, and the package enforces it: `{ state: "granted", purposes: [] }` behaves exactly like `{ state: "none" }`, so it gives no id and clears `ep_vid` and `ep_vsid`. A shopper who agreed to analytics only sends `purposes: ["analytics"]`, and Elastic Path receives only that purpose. Purposes are read from the function on every request and never stored in a cookie, so a change of choice takes effect on the next request.
- `none` means the shopper has not decided. `sessionId: true` opts in to `ep_vsid` (see below).
- `objected` means Reject all, a withdrawal, or Global Privacy Control.
- Write the function for your CMP. The package ships no reader for a specific CMP.

## The `ep_vsid` opt-in

By default a shopper who has not decided gets no visitor id on server calls. A merchant can opt in to `ep_vsid`: a browser-session cookie that gives the shopper one id across server renders and server actions, so unique visitors can be counted. Return `{ state: "none", sessionId: true }` from the consent function to turn it on. The opt-in is part of the result, so you can turn it on per region.

The cookie is `Path=/`, `HttpOnly`, `Secure`, `SameSite=Lax`, with no `Max-Age`, so it ends with the browser session. It is set once and not refreshed, so `Set-Cookie` appears only on the first response. Calls made with it carry `EP-Visitor-Consent: none`, so Elastic Path uses the id for totals only and never links it to an account.

Turn it on only if your legal review accepts it. The basis is the UK statistics exception: ICO guidance on PECR exceptions permits storage for aggregate statistics without consent, if the shopper can object for free. Reject all stops it (the `objected` state clears `ep_vsid` and sets no new one). EU countries apply their own rules, and the EDPB Guidelines 2/2023 (paragraphs 37 and 38) count data in browser memory as stored, so get your own legal review for the EU. This package gives the mechanism, not legal advice.

What you must declare in your cookie notice if you turn it on:

- The cookie name, `ep_vsid` (or the name you set with `sessionCookieName`).
- It is a first-party cookie under statistics, used to count unique visitors.
- It is a random id derived from nothing about the shopper.
- It ends with the browser session. Some browsers restore session cookies when they restart, so do not promise that it always ends when the browser closes.
- The shopper can object, and Reject all stops it.

## Global Privacy Control

`hasGlobalPrivacyControl(request)` returns true when the request carries `Sec-GPC: 1`. The documented default is to treat it as an objection:

```ts
import { hasGlobalPrivacyControl } from "@epcc-sdk/visitor"

const consent: ConsentFunction = (request) =>
  hasGlobalPrivacyControl(request)
    ? { state: "objected" }
    : myCmpConsent(request)
```

Put it first in the function, so it wins over an accepted banner: a shopper whose browser sends Global Privacy Control gets no `ep_vid`, no `ep_vsid` and no visitor headers, and any existing cookie is cleared on the next request.

## Headers

| Header               | Value                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `EP-Visitor-Id`      | the visitor id                                                                                                  |
| `EP-Visitor-Consent` | the granted purposes, comma-separated, for example `analytics,personalization`, or `none` for a session visitor |
| `EP-Analytics`       | `off` keeps the request out of analytics, whatever the visitor state                                            |

`visitorHeaders(visitor)` returns the first two as a plain object. A visitor of kind `none` or `objected` returns an empty object.

`EP-Analytics: off` does not depend on the visitor. Send it on every call from staff, test and bot traffic. Import `ANALYTICS_HEADER` and `ANALYTICS_OFF` to build it yourself, or use the `analyticsOff` option of `createShopperClient`. Without it, no `EP-Analytics` header is sent.

Server calls have no CORS preflight, so the headers work from a server today. Until the platform uses them, Elastic Path ignores them: a live store returned the same status and the same body with and without every header combination in this README.

## The rules

1. The visitor id is never an access key. It cannot open a cart, an order, a price or an account, and nothing in this package uses it as one. Keep sending your normal credentials (token, cart id) as before.
2. No consent means no lasting id. Without consent there is no `ep_vid`. The only id a shopper without consent can have is the `ep_vsid` session id, only if you opted in, and it is sent with `EP-Visitor-Consent: none`.
3. An objection clears every id. Reject all, a withdrawal and Global Privacy Control clear `ep_vid` and `ep_vsid` on the next request and send no visitor headers. Consent after that makes a new id. The old id is never restored.
4. Each request states its consent in `EP-Visitor-Consent`, so an id sent without consent is never mistaken for a lasting id.
5. The id is random and derived from nothing: 128 bits from a cryptographic random source.
6. A malformed `ep_vid` or `ep_vsid` is ignored and replaced, so a crafted value never reaches Elastic Path.

## With the shopper SDK

`createShopperClient` from `@epcc-sdk/sdks-shopper` accepts a `visitor` option and an `analyticsOff` option, and adds the headers to each call. `createVisitorInterceptor` and `createAnalyticsOffInterceptor` are exported from the same package for clients built with `createClient`. See the `@epcc-sdk/sdks-shopper` README, section "Visitor id and analytics".

## With your own HTTP client

```ts
import {
  ANALYTICS_HEADER,
  ANALYTICS_OFF,
  visitorHeaders,
} from "@epcc-sdk/visitor"

const response = await fetch(
  "https://useast.api.elasticpath.com/catalog/products",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...visitorHeaders(visitor),
      ...(isStaffOrBot ? { [ANALYTICS_HEADER]: ANALYTICS_OFF } : {}),
    },
  },
)
```

## Next.js

Next.js middleware receives a `NextRequest`, which is a Fetch API `Request`, so pass it straight to `resolveVisitor`. Two details matter, and the `analytics-integration` example shows both working (`src/lib/visitor/visitor-middleware.ts` and `read-server-visitor.ts`).

- Set the cookies through `response.cookies`, not by appending a raw `Set-Cookie` header. Next.js copies cookies set that way into the request that the same response renders, so the server calls of a new visitor's first page already carry the cookie's id. With a raw header, each server call in that render makes its own id. Parse each value with `new NextResponse(null, { headers: { "Set-Cookie": setCookie } }).cookies.getAll()`, call `response.cookies.set(cookie)` for a cookie with a value, and for a cleared one call it with `{ ...cookie, value: "", maxAge: 0 }` (Next.js drops `Max-Age=0` when it parses a cleared cookie, and `response.cookies.delete(name)` drops `Secure`, `SameSite` and `HttpOnly`, so clear with the attributes the package returned).
- Elastic Path calls that the middleware makes itself, such as the access token and the cart, do not pass through a client interceptor that reads `cookies()`. Hand the `visitor` that `resolveVisitor` returned to the later middleware, and send `visitorHeaders(visitor)` on those calls, so the first request of a new visitor carries the same id as the calls that follow.
- In server components and server actions, build the visitor again from `cookies()` and `headers()`, and give `resolveVisitor` a `Request` whose `Cookie` header is built from the decoded values (`cookies().getAll()`), not from `cookies().toString()`. `toString()` URL-encodes values, so a consent cookie such as `analytics,personalization` reaches your consent function as `analytics%2Cpersonalization`.

## Express and Fastify

`resolveVisitor` reads a Fetch API `Request`. Next.js, Remix, Astro, SvelteKit, Hono and Cloudflare Workers hand you one, so they need no adapter. Express and Fastify do not, so convert the request, then copy the `Set-Cookie` values back onto their response.

Express:

```ts
import express from "express"
import type { Request as ExpressRequest } from "express"
import { readCookie, resolveVisitor, visitorHeaders } from "@epcc-sdk/visitor"
import type { ConsentFunction } from "@epcc-sdk/visitor"

const consent: ConsentFunction = (request) =>
  readCookie(request, "my_cmp_consent") === "accepted"
    ? { state: "granted", purposes: ["analytics", "personalization"] }
    : { state: "none" }

function toFetchRequest(req: ExpressRequest): Request {
  const headers = new Headers()
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item)
    } else if (value !== undefined) {
      headers.set(name, value)
    }
  }
  return new Request(`${req.protocol}://${req.get("host")}${req.originalUrl}`, {
    headers,
  })
}

const app = express()

app.use(async (req, res, next) => {
  try {
    const { visitor, setCookies } = await resolveVisitor(toFetchRequest(req), {
      consent,
    })
    for (const cookie of setCookies) res.append("Set-Cookie", cookie)
    res.locals.visitor = visitor
    next()
  } catch (error) {
    next(error)
  }
})

app.get("/products", async (_req, res) => {
  const response = await fetch(
    "https://useast.api.elasticpath.com/catalog/products",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...visitorHeaders(res.locals.visitor),
      },
    },
  )
  res.status(response.status).json(await response.json())
})
```

Fastify:

```ts
import Fastify from "fastify"
import type { FastifyRequest } from "fastify"
import { readCookie, resolveVisitor, visitorHeaders } from "@epcc-sdk/visitor"
import type { ConsentFunction, Visitor } from "@epcc-sdk/visitor"

const consent: ConsentFunction = (request) =>
  readCookie(request, "my_cmp_consent") === "accepted"
    ? { state: "granted", purposes: ["analytics", "personalization"] }
    : { state: "none" }

function toFetchRequest(request: FastifyRequest): Request {
  const headers = new Headers()
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item)
    } else if (value !== undefined) {
      headers.set(name, value)
    }
  }
  return new Request(
    `${request.protocol}://${request.hostname}${request.url}`,
    {
      headers,
    },
  )
}

declare module "fastify" {
  interface FastifyRequest {
    visitor: Visitor | null
  }
}

const app = Fastify()

app.decorateRequest("visitor", null)

app.addHook("onRequest", async (request, reply) => {
  const { visitor, setCookies } = await resolveVisitor(
    toFetchRequest(request),
    {
      consent,
    },
  )
  if (setCookies.length > 0) reply.header("Set-Cookie", setCookies)
  request.visitor = visitor
})

app.get("/products", async (request, reply) => {
  const response = await fetch(
    "https://useast.api.elasticpath.com/catalog/products",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...visitorHeaders(request.visitor ?? { kind: "none" }),
      },
    },
  )
  reply.status(response.status)
  return response.json()
})
```

Notes for both:

- `accessToken` in the snippets is the shopper token you already send to Elastic Path.
- `resolveVisitor` reads only headers, so the URL you give `Request` does not matter. Behind a proxy, `req.protocol` and `request.protocol` follow your trust-proxy setting; either value works here.
- Fastify keeps a decorator's initial value shared across requests, so decorate with `null` and set the visitor in the hook, as above. Decorating with an object throws.
- Fastify's `reply.header("Set-Cookie", [...])` adds to cookies another plugin already set. In Express, `res.append` does the same. Do not use `res.set` or `res.cookie` for these values: they replace or re-encode what `resolveVisitor` returned.

## Other languages (raw HTTP)

A backend in any language can implement the contract. The rules in order, on each incoming request:

1. Ask your consent logic for the shopper's state: granted (with purposes), none, or objected. Treat `Sec-GPC: 1` as objected.
2. Granted: read the `ep_vid` cookie. If it is 32 lowercase hex characters, keep it. Otherwise make a new id from a cryptographic random source (128 bits, written as 32 lowercase hex characters, for example Python `secrets.token_hex(16)`) and set the cookie below. Clear `ep_vsid` if it is present.
3. None: send no visitor headers. Clear `ep_vid` and `ep_vsid` if present. If you opted in to the session id, keep a valid `ep_vsid` or make one (set once, never refreshed), clear `ep_vid` if present, and send the id with consent `none`.
4. Objected: send no visitor headers. Clear `ep_vid` and `ep_vsid` if present.
5. Add the headers to every Elastic Path call the request makes, including the first request of a new visitor (use the id you just made, not the cookie, which the browser has not sent yet).
6. Send `Set-Cookie` only on a response where a cookie changes.

Cookies the response sets:

```http
Set-Cookie: ep_vid=3af1962a5609fb7e76b16dabc7ea281e; Path=/; Max-Age=31536000; Secure; SameSite=Lax
Set-Cookie: ep_vsid=0b32c7f81d4a4e6f9a1c5d7e2b8f3a60; Path=/; Secure; SameSite=Lax; HttpOnly
Set-Cookie: ep_vid=; Path=/; Max-Age=0; Secure; SameSite=Lax
Set-Cookie: ep_vsid=; Path=/; Max-Age=0; Secure; SameSite=Lax; HttpOnly
```

The first sets a lasting id, the second a session id (no `Max-Age`), the last two clear them. A cookie is cleared with the same `Path` it was set with.

A consented shopper who agreed to analytics and personalization:

```http
GET /catalog/products HTTP/1.1
Host: useast.api.elasticpath.com
Authorization: Bearer <access token>
EP-Visitor-Id: 3af1962a5609fb7e76b16dabc7ea281e
EP-Visitor-Consent: analytics,personalization
```

A shopper who agreed to analytics only:

```http
EP-Visitor-Id: 3af1962a5609fb7e76b16dabc7ea281e
EP-Visitor-Consent: analytics
```

A shopper who has not decided, with the `ep_vsid` opt-in on:

```http
EP-Visitor-Id: 0b32c7f81d4a4e6f9a1c5d7e2b8f3a60
EP-Visitor-Consent: none
```

A shopper who has not decided without the opt-in, or who objected: send neither header.

A staff, test or bot request, whatever the shopper state (it can sit beside the visitor headers or on its own):

```http
EP-Analytics: off
```

## Browser-only storefronts

This package has no browser entry yet. A browser call with a custom header needs a CORS preflight, and until Elastic Path allows `EP-Visitor-Id`, `EP-Visitor-Consent` and `EP-Analytics` in `Access-Control-Allow-Headers`, a browser call that carries them fails. Send the headers from a server. When a browser entry ships, an id for a shopper without consent will live in memory only and reset on a full page load, and a lasting id written by JavaScript is limited to 7 days by Safari.

## Exports

| Export                                                            | What it is                                                                                                                  |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `resolveVisitor(request, options)`                                | Resolves the visitor and the `Set-Cookie` values. Options: `consent`, `cookieName`, `sessionCookieName`, `lifetimeSeconds`. |
| `visitorHeaders(visitor)`                                         | `EP-Visitor-Id` and `EP-Visitor-Consent` as a plain object.                                                                 |
| `hasGlobalPrivacyControl(request)`                                | True when `Sec-GPC: 1`.                                                                                                     |
| `readCookie(request, name)`                                       | Reads one cookie from a `Request`.                                                                                          |
| `VISITOR_COOKIE`, `SESSION_VISITOR_COOKIE`                        | `ep_vid`, `ep_vsid`.                                                                                                        |
| `VISITOR_ID_HEADER`, `VISITOR_CONSENT_HEADER`, `ANALYTICS_HEADER` | The header names.                                                                                                           |
| `ANALYTICS_OFF`, `CONSENT_NONE`                                   | `"off"`, `"none"`.                                                                                                          |
| `PURPOSE_ANALYTICS`, `PURPOSE_PERSONALIZATION`                    | The purpose values.                                                                                                         |
| `GLOBAL_PRIVACY_CONTROL_HEADER`                                   | `Sec-GPC`.                                                                                                                  |
| `VISITOR_COOKIE_LIFETIME_SECONDS`                                 | 365 days.                                                                                                                   |
| Types                                                             | `ConsentFunction`, `ConsentResult`, `Purpose`, `ResolvedVisitor`, `ResolveVisitorOptions`, `Visitor`.                       |

Cookie names, the `ep_vid` lifetime and the other defaults can be changed through `resolveVisitor` options. The platform team confirms the final names before 1.0.
