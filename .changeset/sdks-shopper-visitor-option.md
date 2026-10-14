---
"@epcc-sdk/sdks-shopper": minor
---

Send the visitor id and its consent on every call.

- `createShopperClient` takes a third argument with a `visitor` option: a `Visitor` from `@epcc-sdk/visitor`, or a function that returns one for each call. Every call then carries `EP-Visitor-Id` and `EP-Visitor-Consent`. Without the option, no visitor headers are sent.
- `createVisitorInterceptor` is exported from the package root for clients built with `createClient`.
- `@epcc-sdk/sdks-shopper` now depends on `@epcc-sdk/visitor`.
