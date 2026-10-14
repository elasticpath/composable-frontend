# @epcc-sdk/visitor

Visitor id for Elastic Path storefronts. The package gives a shopper who consented a lasting visitor id in a first-party cookie, and builds the request headers that carry that id and the shopper's consent to Elastic Path Composable Commerce. It has no dependencies and uses only the Fetch API, so it runs in Node, edge runtimes and Workers.

The package version is below 1.0 until Elastic Path confirms the final header and cookie names.

## Install

```bash
npm install @epcc-sdk/visitor
```

## Use

You supply a consent function. It reads the request, for example your consent management platform (CMP) cookie, and returns the purposes the shopper agreed to.

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

A granted shopper gets one `ep_vid` cookie: `Path=/`, `Secure`, `SameSite=Lax`, readable by browser code, lasting 365 days from creation. The lifetime does not roll. The id is 128 random bits written as 32 lowercase hex characters, and any other cookie value counts as absent.

## Consent states

Your consent function returns one of three results, and `resolveVisitor` turns it into a visitor and cookie changes. Purposes are read from the consent function on every request and never stored in a cookie.

| Consent result                       | Visitor                              | Cookies                                                                |
| ------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------- |
| `{ state: "granted", purposes }`     | `lasting`, sends the purposes        | Keeps a valid `ep_vid` or sets a new one. Clears `ep_vsid` if present. |
| `{ state: "none" }`                  | `none`, sends no visitor headers     | Clears `ep_vid` and `ep_vsid` if present.                              |
| `{ state: "none", sessionId: true }` | `session`, sends consent `none`      | Keeps a valid `ep_vsid` or sets a new one. Clears `ep_vid` if present. |
| `{ state: "objected" }`              | `objected`, sends no visitor headers | Clears `ep_vid` and `ep_vsid` if present.                              |

The default for a shopper who has not decided is `none`: server calls carry no visitor id, as with Algolia. A new `ep_vid` is never linked to an earlier `ep_vsid`, and a new consent after an objection always makes a new id, because the objection cleared the old one.

### The `ep_vsid` opt-in

`sessionId: true` is for a merchant whose legal review accepts the UK statistics exception (ICO guidance on PECR exceptions: storage for aggregate statistics, if the shopper can object for free). The visitor id is then kept in `ep_vsid`, so it stays the same across server renders and server actions in a server-rendered storefront. The cookie is `Path=/`, `HttpOnly`, `Secure`, `SameSite=Lax` with no `Max-Age`, so it ends with the browser session. It is set once and not refreshed, so `Set-Cookie` appears only on the first response. Some browsers restore session cookies when they restart. Declare the cookie under statistics in your cookie notice. EU countries apply their own rules, so get your own legal review. Because the opt-in is part of the consent result, you can turn it on per region.

### Global Privacy Control

`hasGlobalPrivacyControl(request)` returns true when the request carries `Sec-GPC: 1`. The documented default is to treat it as an objection:

```ts
const consent: ConsentFunction = (request) =>
  hasGlobalPrivacyControl(request)
    ? { state: "objected" }
    : myCmpConsent(request)
```

### Cookie names

`resolveVisitor` takes `cookieName` for `ep_vid` and `sessionCookieName` for `ep_vsid`. Both are used for reading, setting and clearing.

## Headers

| Header               | Value                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `EP-Visitor-Id`      | the visitor id                                                                                                  |
| `EP-Visitor-Consent` | the granted purposes, comma-separated, for example `analytics,personalization`, or `none` for a session visitor |
| `EP-Analytics`       | `off` keeps the request out of analytics, whatever the visitor state           |

`visitorHeaders(visitor)` returns these as a plain object. A visitor of kind `none` or `objected` returns an empty object.

`EP-Analytics: off` does not depend on the visitor. Send it on every call from staff, test and bot traffic. Import `ANALYTICS_HEADER` and `ANALYTICS_OFF` to build it yourself, or use the `analyticsOff` option of `createShopperClient`.

## With the shopper SDK

`createShopperClient` from `@epcc-sdk/sdks-shopper` accepts a `visitor` option and adds the headers to each call. See that package.
