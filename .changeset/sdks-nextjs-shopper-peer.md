---
"@epcc-sdk/sdks-nextjs": minor
---

Take the client type from `@epcc-sdk/sdks-shopper` and stop depending on `@hey-api/client-fetch`.

Breaking in practice:

- `@epcc-sdk/sdks-shopper` is now a peer dependency at `^0.6.0`. Install it beside this package. A shopper below 0.6.0 gives a peer warning at install, because its client is a different implementation from the one these types describe.
- `@hey-api/client-fetch` is no longer installed with this package. Code that imported it only to type the client passed to `applyDefaultNextMiddleware` should import `Client` from `@epcc-sdk/sdks-shopper` instead.

Unchanged: `applyDefaultNextMiddleware`, `createDefaultNextMiddlewareStack`, `RequestMiddleware`, `ResponseMiddleware`, `MiddlewareStack`, the cookie interceptors, `getCookieValue`, `getAccountCookie` and `isAccountAuthenticated` keep their names and signatures.

The published package no longer includes its test files.
