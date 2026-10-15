---
"@epcc-sdk/sdks-accounts-addresses": major
"@epcc-sdk/sdks-accounts": major
"@epcc-sdk/sdks-application-keys": major
"@epcc-sdk/sdks-authentication-realms": major
"@epcc-sdk/sdks-cart-checkout-order": major
"@epcc-sdk/sdks-catalog-search": major
"@epcc-sdk/sdks-catalogs": major
"@epcc-sdk/commerce-extensions": major
"@epcc-sdk/sdks-currencies": major
"@epcc-sdk/sdks-files": major
"@epcc-sdk/flows": major
"@epcc-sdk/integrations": major
"@epcc-sdk/sdks-inventories": major
"@epcc-sdk/sdks-merchant-realm-mapping": major
"@epcc-sdk/payments": major
"@epcc-sdk/permissions": major
"@epcc-sdk/personal-data": major
"@epcc-sdk/sdks-pxm": major
"@epcc-sdk/sdks-pricebooks": major
"@epcc-sdk/promotions-standard": major
"@epcc-sdk/rule-promotions": major
"@epcc-sdk/settings": major
"@epcc-sdk/sdks-shopper": major
"@epcc-sdk/sdks-subscriptions": major
---

The `/zod` export now generates Zod 4 schemas, and each schema carries its description from the spec. `z.toJSONSchema()` includes those descriptions.

The `zod` peer dependency moves from `^3.22.0` to `^4.0.0`. Upgrade `zod` to 4 and upgrade every `@epcc-sdk` package that has a `/zod` export at the same time. The packages cannot share one install of zod while their peer ranges are on different majors. The SDK functions and types do not change.

Zod 4 validates `format: uuid` fields strictly. A value whose version or variant digits do not follow RFC 9562 now fails to parse, although Zod 3 accepted it.
