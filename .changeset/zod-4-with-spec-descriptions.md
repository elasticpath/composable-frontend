---
"@epcc-sdk/sdks-accounts-addresses": minor
"@epcc-sdk/sdks-accounts": minor
"@epcc-sdk/sdks-application-keys": minor
"@epcc-sdk/sdks-authentication-realms": minor
"@epcc-sdk/sdks-cart-checkout-order": minor
"@epcc-sdk/sdks-catalog-search": minor
"@epcc-sdk/sdks-catalogs": minor
"@epcc-sdk/commerce-extensions": minor
"@epcc-sdk/sdks-currencies": minor
"@epcc-sdk/sdks-files": minor
"@epcc-sdk/flows": minor
"@epcc-sdk/integrations": minor
"@epcc-sdk/sdks-inventories": minor
"@epcc-sdk/sdks-merchant-realm-mapping": minor
"@epcc-sdk/payments": minor
"@epcc-sdk/permissions": minor
"@epcc-sdk/personal-data": minor
"@epcc-sdk/sdks-pxm": minor
"@epcc-sdk/sdks-pricebooks": minor
"@epcc-sdk/promotions-standard": minor
"@epcc-sdk/rule-promotions": minor
"@epcc-sdk/settings": minor
"@epcc-sdk/sdks-shopper": minor
"@epcc-sdk/sdks-nextjs": minor
"@epcc-sdk/sdks-subscriptions": minor
---

The `/zod` export now generates Zod 4 schemas, and each schema carries its description from the spec. `z.toJSONSchema()` includes those descriptions.

The `zod` peer dependency moves from `^3.22.0` to `^4.0.0`. Upgrade `zod` to 4 and upgrade every `@epcc-sdk` package that has a `/zod` export at the same time. The packages cannot share one install of zod while their peer ranges are on different majors. The SDK functions and types do not change.

Zod 4 validates `format: uuid` fields strictly. A value whose version or variant digits do not follow RFC 9562 now fails to parse, although Zod 3 accepted it. Validation errors use Zod 4's issue format. For example, a missing enum value is reported as `invalid_value` where Zod 3 reported `invalid_type`.

`@epcc-sdk/sdks-nextjs` accepts `@epcc-sdk/sdks-shopper` 0.8 as a peer dependency, as well as 0.7.
