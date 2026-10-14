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

- `visitor`: `{ kind: "lasting", id, purposes }`, `{ kind: "none" }` or `{ kind: "objected" }`.
- `setCookies`: raw `Set-Cookie` values to add to the response. The list is empty when `ep_vid` already holds a valid id, so most responses stay cacheable.

A granted shopper gets one `ep_vid` cookie: `Path=/`, `Secure`, `SameSite=Lax`, readable by browser code, lasting 365 days from creation. The lifetime does not roll. The id is 128 random bits written as 32 lowercase hex characters, and any other cookie value counts as absent.

## Headers

| Header               | Value                                                                          |
| -------------------- | ------------------------------------------------------------------------------ |
| `EP-Visitor-Id`      | the visitor id                                                                 |
| `EP-Visitor-Consent` | the granted purposes, comma-separated, for example `analytics,personalization` |
| `EP-Analytics`       | `off` keeps the request out of analytics, whatever the visitor state           |

`visitorHeaders(visitor)` returns these as a plain object. A visitor of kind `none` or `objected` returns an empty object.

`EP-Analytics: off` does not depend on the visitor. Send it on every call from staff, test and bot traffic. Import `ANALYTICS_HEADER` and `ANALYTICS_OFF` to build it yourself, or use the `analyticsOff` option of `createShopperClient`.

## With the shopper SDK

`createShopperClient` from `@epcc-sdk/sdks-shopper` accepts a `visitor` option and adds the headers to each call. See that package.
