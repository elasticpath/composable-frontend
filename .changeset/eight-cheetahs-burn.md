---
"@epcc-sdk/sdks-merchant-realm-mapping": patch
"@epcc-sdk/sdks-authentication-realms": patch
"@epcc-sdk/sdks-cart-checkout-order": patch
"@epcc-sdk/commerce-extensions": patch
"@epcc-sdk/promotions-standard": patch
"@epcc-sdk/sdks-accounts-addresses": patch
"@epcc-sdk/sdks-application-keys": patch
"@epcc-sdk/rule-promotions": patch
"@epcc-sdk/authentication": patch
"@epcc-sdk/personal-data": patch
"@epcc-sdk/sdks-subscriptions": patch
"@epcc-sdk/integrations": patch
"@epcc-sdk/sdks-inventories": patch
"@epcc-sdk/permissions": patch
"@epcc-sdk/sdks-currencies": patch
"@epcc-sdk/sdks-pricebooks": patch
"@epcc-sdk/sdks-accounts": patch
"@epcc-sdk/payments": patch
"@epcc-sdk/settings": patch
"@epcc-sdk/sdks-files": patch
"@epcc-sdk/flows": patch
"@epcc-sdk/sdks-pxm": patch
"@epcc-sdk/sdks-nextjs": patch
---

Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

Key changes:

- Added tsup build configuration for all SDK packages
- Updated package.json files to use proper ESM and CommonJS paths
- Added `type: "module"` to specify ESM as the default format
- Configured package exports to support both import and require
- Fixed type exports using `export type` to support isolation mode
- Added test files for both ESM and CommonJS consumption
