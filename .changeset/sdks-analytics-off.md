---
"@epcc-sdk/visitor": patch
"@epcc-sdk/sdks-shopper": minor
---

Keep a request out of analytics with `EP-Analytics: off`.

- `@epcc-sdk/visitor` exports `ANALYTICS_OFF` (`"off"`) beside the existing `ANALYTICS_HEADER`.
- `createShopperClient` takes an `analyticsOff` option beside `visitor`. When it is `true`, every call carries `EP-Analytics: off`, whatever the visitor state and with or without a `visitor` option. Without it, no `EP-Analytics` header is sent.
- `createAnalyticsOffInterceptor` is exported from the package root for clients built with `createClient`.
