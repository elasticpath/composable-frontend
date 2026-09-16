# @epcc-sdk/sdks-accounts

## 0.1.0

### Minor Changes

- e755d2ce: Refresh the carts and accounts OpenAPI specs against the canonical specs in `elasticpath-dev`.

  **`@epcc-sdk/sdks-accounts`** — adds the nine missing operations: five on `/v2/account-tags`
  (`listAccountTags`, `createAnAccountTag`, `getAnAccountTag`, `updateAnAccountTag`,
  `deleteAnAccountTag`), three on `/v2/accounts/{accountID}/relationships/account-tags`
  (`getAnAccountTagsRelationship`, `addAccountTagsOnAccount`, `removeAccountTagsOnAccount`),
  plus `putV2AccountMembersAccountMemberId`.

  Note for callers: the canonical spec marks fields as `required` on five authentication request
  bodies that previously had none — `PasswordRequest`, `PasswordlessRequest`, `SelfSignupRequest`,
  `OpenIDConnectRequest` and `SwitchingAccountRequest`. Code that already sends a complete request
  is unaffected; code that relied on these being fully optional will now need the documented
  fields.

  **`@epcc-sdk/sdks-cart-checkout-order`** — adds the three component-product tax operations
  (`addTaxItemToCartItemComponent`, `updateTaxItemFromCartItemComponent`,
  `deleteTaxItemFromCartItemComponent`) and four cart settings operations (`getV2SettingsCart`,
  `putV2SettingsCart`, `getV2SettingsCartStoreId`, `putV2SettingsCartStoreId`).

  **`@epcc-sdk/sdks-shopper`** — gains the same seven cart operations. The shopper accounts
  surface is unchanged.

  **No exported type or function is removed from any of the three packages.** The canonical carts
  spec remodels a cart item as one flat `CartItemResponse` with a `type` discriminator, replacing
  the four-way union our SDKs expose. That model is deliberately kept: `CartsResponse`,
  `CartItemsResponse`, `CartItemObject` and `Data.StripeConnectPayment` are preserved, and
  `manageCarts`, `deleteACartItem`, `updateACartItem` and `getCartItems` still return the union
  wrappers. The divergence is now written down in `packages/sdks/specs/patches/README.md` so the
  next refresh does not silently drop it.

  The `commerce-extensions` spec is deliberately left untouched: its checked-in copy is a strict
  superset of the canonical spec, so refreshing it would remove operations and rename exports for
  no gain.

## 0.0.5

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.4

### Patch Changes

- ce0c960: support esm modules accounts sdk

## 0.0.3

### Patch Changes

- d3d3c11: Update to match latest specs

## 0.0.2

### Patch Changes

- bf38722: Updated readme

## 0.0.1

### Patch Changes

- 6324423: Add accounts sdk
