# @epcc-sdk/sdks-nextjs

Next.js helpers for `@epcc-sdk/sdks-shopper`. They read the shopper token and the account token from cookies and add them to each request. They work in server components, route handlers and the browser.

## Installation

```bash
npm install @epcc-sdk/sdks-nextjs @epcc-sdk/sdks-shopper
```

## Quick start

```ts
import { createClient } from "@epcc-sdk/sdks-shopper"
import { applyDefaultNextMiddleware } from "@epcc-sdk/sdks-nextjs"

const client = createClient({
  baseUrl: "https://euwest.api.elasticpath.com",
})

applyDefaultNextMiddleware(client, {
  cookieKey: "_store_ep_credentials",
  accountCookieKey: "_store_ep_account_member_token",
})
```

`applyDefaultNextMiddleware` adds two request interceptors to the client:

1. The first reads the token cookie and sets the `Authorization` header. The cookie must contain JSON with an `access_token` field.
2. The second reads the account cookie and sets the `EP-Account-Management-Authentication-Token` header to the token of the selected account.

On the server, the interceptors read cookies with `cookies()` from `next/headers`. In the browser, they read `document.cookie`. If a cookie is not there, the interceptor does not change the request.

The values in the example are the default cookie names. Your application must write these cookies, for example when a shopper signs in.

## Other exports

| Export                             | What it does                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `createDefaultNextMiddlewareStack` | Returns the two interceptors as a list, so that you can add them yourself or add your own. |
| `createAuthCookieInterceptor`      | Returns only the token cookie interceptor.                                                 |
| `createAccountCookieInterceptor`   | Returns only the account cookie interceptor.                                               |
| `isAccountAuthenticated`           | Returns `true` if the account cookie has a value.                                          |
| `getAccountCookie`                 | Returns the value of the account cookie.                                                   |
| `getCookieValue`                   | Returns the value of a cookie from `document.cookie`.                                      |

The interceptors do not get a new token after a 401 response. To get new tokens automatically, use `createShopperClient` or `configureClient` from `@epcc-sdk/sdks-shopper`.
