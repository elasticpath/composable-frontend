# @epcc-sdk/sdks-cart-checkout-order

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

## 0.0.8

### Patch Changes

- b7736679: add support for external_ref in shipping groups

## 0.0.7

### Patch Changes

- 60f1e9c: Updated cart sdk to match latest spec

## 0.0.6

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.5

### Patch Changes

- 09d3a57: add missing cart properties

## 0.0.4

### Patch Changes

- 1a19c39: Add include to get an order operation
- a4adea2: add customer details to order response

## 0.0.3

### Patch Changes

- 1e94fe3: add include for cart checkout get orders

## 0.0.2

### Patch Changes

- d3d3c11: Update to match latest specs

## 0.0.1

### Patch Changes

- 0733828: add cart, checkout, order sdks
