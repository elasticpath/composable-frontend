---
"@epcc-sdk/sdks-cart-checkout-order": minor
"@epcc-sdk/sdks-accounts": minor
"@epcc-sdk/sdks-shopper": minor
---

Refresh the carts and accounts OpenAPI specs against the canonical specs in `elasticpath-dev`.

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
