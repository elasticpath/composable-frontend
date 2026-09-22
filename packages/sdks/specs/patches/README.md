# Spec divergences

Some specs in this directory are **not** copies of the canonical spec in
`commerce-cloud/elasticpath-dev` (`static/assets/openapispecs/<service>/OpenAPISpec.yaml`).
They deliberately keep an older or different model because our published packages, the
redocly overrides, or the example storefronts depend on it.

**Copying a canonical spec over one of these silently deletes exported types from published
packages.** Nothing catches it: no build or test workflow runs on a PR in this repo, so the
first sign is a broken `Release` run on `main` or a red example deploy.

Before refreshing any spec listed here, re-apply its divergences and then check that
**no exported symbol disappeared**:

```bash
git show origin/main:packages/sdks/<pkg>/src/client/types.gen.ts \
  | grep -oE '^export (type|const) [A-Za-z0-9_]+' | awk '{print $NF}' | sort -u > /tmp/before.txt
grep -oE '^export (type|const) [A-Za-z0-9_]+' packages/sdks/<pkg>/src/client/types.gen.ts \
  | awk '{print $NF}' | sort -u > /tmp/after.txt
comm -23 /tmp/before.txt /tmp/after.txt   # must be empty
```

Compare against `origin/main`, not `HEAD` — once you have committed, `HEAD` is your own change.

## `cart_checkout.yaml`

Canonical models a cart item as **one flat `CartItemResponse`** carrying a `type`
discriminator (`cart_item | custom_item | subscription_item | promotion_item`), wrapped in
`CartItemCollectionResponse`. Our published SDKs instead expose a **four-way union** of item
objects. `overrides/cart_checkout_components.yaml` redefines `CartsResponse` and `CartIncluded`
on top of that union, and `examples/*/src/lib/group-cart-items.ts` imports the union members
by name.

Rather than re-applying that by hand after every overwrite, it lives in
`overrides/cart_checkout_item_union.yaml`, which `config/redocly.yaml` merges in through
`override/component-merge`, where a refresh cannot reach it. The spec can be replaced by
canonical verbatim, and is byte-identical to it today.

That file holds two things. Four schemas canonical no longer has:

| Schema | Why |
| --- | --- |
| `CartsResponse` | union response wrapper; the override redefines it and five examples import it |
| `CartItemsResponse` | union response wrapper for `getCartItems` |
| `CartItemObject` | union member; `group-cart-items.ts` imports it by name |
| `Data.StripeConnectPayment` | canonical no longer models the `stripe_connect` gateway |

And four success responses pointed back at the union wrappers, not at canonical's
`CartItemCollectionResponse`:

| Operation | Status | Keep as |
| --- | --- | --- |
| `manageCarts` | 201 | `CartsResponse` |
| `deleteACartItem` | 200 | `CartsResponse` |
| `updateACartItem` | 200 | `CartsResponse` |
| `getCartItems` | 200 | `CartItemsResponse` |

A merge adds whatever key it is given, so an override naming a path, operation or response
the spec no longer has would inject a phantom one and silently drop the repoint it was meant
to apply, and a renamed schema would leave a dangling `$ref`. `component-merge` rejects all
four instead: redocly reports the decorator problem, the bundle is not written and the build
fails, naming the override file and what it could not find.

Two packages read this spec and both need the union, so the merge runs twice. `cart-checkout@v1`
produces `bundled/cart_checkout.yaml` for the shopper join. `cart-checkout-standalone@v1`
produces `bundled/cart_checkout_standalone.yaml`, which `@epcc-sdk/sdks-cart-checkout-order`
generates from; it applies the same merge and none of the prefixing or parameter overrides the
join needs, so that package keeps `Timestamps` unprefixed. Its build depends on
`@epcc-sdk/sdks-shopper#build` in `turbo.json` for the same reason
`@epcc-sdk/sdks-catalog-search` does: `bundled/` is gitignored, and shopper's
`oas:redocly:bundle` is what writes it.

`bulkUpdateItemsInCart` 200 had no schema at all before, so taking canonical's
`CartItemCollectionResponse` there is purely additive — leave it on canonical.

Everything else can be taken from canonical as-is. `CartItemResponse` itself is safe to take
from canonical: it is a superset of the old narrow "Cart Item Relationship" schema, and the
union members `allOf` onto it, so they only gain fields.

Whether to move the SDKs onto canonical's flat model is a real question, but it is a breaking
change across the published packages and every example — not something to do as a side effect
of a spec refresh.

The export diff cannot see a lost repoint: the names stay exported either way, only the
response type changes. The gate that catches it is the example typecheck, which fails on
`CartItemResponse[]` not being assignable to the union.

## `commerce-extensions.yaml`

**Do not refresh.** The checked-in spec is a strict superset of canonical: it has five real
`/v2/extensions/{slug}` operations that canonical omits and that our documentation recommends,
and five shared `operationId`s differ. Refreshing it would remove operations and rename five
exported functions for no gain.

## `account_management.yaml`

Eight `x-sdk-filter: ['shopper']` annotations that canonical does not have, on the account and
account-member reads plus account creation, account update and account member token issue.
Rather than re-applying them after every overwrite, the selection lives in `config/redocly.yaml`
under `account_management@v1`'s `filter-operations-by-extension.operationIds`, where a refresh
cannot reach it, and the markers are gone from the spec. It can be replaced by canonical
verbatim: with the markers removed the checked-in spec is byte-identical to canonical, so a
refresh is a no-op today.

The ids are kebab-case here, unlike the CamelCase ones elsewhere:

`post-v2-accounts`, `get-v2-accounts`, `get-v2-accounts-accountID`, `put-v2-accounts-accountID`,
`get-v2-account-members`, `get-v2-account-members-accountMemberID`,
`get-v2-accounts-accountID-account-memberships`, `post-v2-account-members-tokens`

An id in that list that matches no operation throws rather than silently keeping nothing, so a
canonical rename fails the build instead of shrinking the SDK.

The check that the allow-list is doing its job: `deleteV2AccountsAccountId` is absent from
`packages/sdks/shopper/src/client/sdk.gen.ts` and present in
`packages/sdks/accounts/src/client/sdk.gen.ts`.

Canonical's `components.responses.ForbiddenError` has a body that differs from the subscriptions
one, which breaks `redocly join`. It is on `account_management@v1`'s `prefix-components`
allow-list in `config/redocly.yaml` so it becomes `AccountManagementForbiddenError`; `filterKeys`
there is an allow-list of names **to** prefix.

One drift this design does not catch: if canonical reintroduces a schema the override shadows, with a
different shape, the override silently wins. The asserts cover a missing path and a dangling `$ref`, not a
redefinition. Compare the four schemas against canonical when the cart spec next changes shape.

## `inventories.yaml`

Two `x-sdk-filter: ['shopper']` annotations that canonical does not have, on `GetStock` and
`ListLocations` — the multi-location inventory operations `examples/list-products` is built on.
Rather than re-applying them after every overwrite, the selection lives in
`config/redocly.yaml` under `inventories@v1`'s `filter-operations-by-extension.operationIds`,
where a refresh cannot reach it, and the markers are gone from the spec. It can be replaced by
canonical verbatim.

An id in that list that matches no operation throws rather than silently keeping nothing, so a
canonical rename fails the build instead of shrinking the SDK.

Canonical also adds import-job schemas — `Import`, `ImportAttributes`, `ImportMeta`,
`ImportRecords`, `JobTimestamps` — and an `Imports` tag, all of which collide by name and shape
with subscriptions' in the shopper join. They are on `inventories@v1`'s `prefix-components`
`filterKeys` and `prefix-tags` `filterTags`, so they become `InventoriesImport*` and the names
shopper exports today are unchanged.

## `authentication.yaml`

Not a copy of canonical and not refreshable as one. Canonical inlines its request and response
bodies and defines only `Errors`; our copy names `AccessTokenRequest`, `AccessTokenResponse`,
`ErrorResponse` and `Error`, which consumers import. The shapes are identical — this is a
naming divergence, not an API one. See #545, which made that call deliberately.

`@epcc-sdk/sdks-shopper` no longer depends on the spec carrying the name: `src/auth/access-token.ts`
derives `AccessTokenResponse` from the generated `CreateAnAccessTokenResponses[200]`, so the
exported name survives a refresh and still tracks whatever canonical says the body is.

## `currencies.yaml`, `files.yaml`, `subscriptions.yaml`

Same pattern as `inventories.yaml`, for the same reason: each carried `x-sdk-filter: ['shopper']`
markers canonical does not have, and losing them emptied that part of `@epcc-sdk/sdks-shopper`.
The selections now live in `config/redocly.yaml` as `operationIds` — currencies
`getAllCurrencies`, `getACurrency`; files `getAllFiles`, `getAFile`; subscriptions 20 ids from
`ListOfferings` to `GetFeature`. A canonical rename fails the build rather than shrinking the SDK.

Canonical has also re-baselined subscriptions onto `/v2/subscriptions/...`, with the `/v2`
dropped from its server url, while `subscriptions@v1` still applies `prefix-paths: /v2`. Do not
delete that decorator: the spec checked in today still needs it. `prefix-paths` is idempotent
instead, so it leaves an already-prefixed path alone. Without that, a refresh emits
`/v2/v2/subscriptions/...` — which the export-diff gate cannot see, because the export count
does not change.


## `catalog_view.yaml`

Not a divergence — it is a plain copy of canonical and stays refreshable. It is listed here
because one thing about it is easy to miss.

It carries **two APIs**: 16 `/catalog/*` shopper-view operations and 30 admin operations under
21 `/catalogs*` paths. The shopper-view half goes into the shopper join. The admin half is the
whole of `@epcc-sdk/sdks-catalogs`, selected by `catalogs@v1` in `config/redocly.yaml`, which
lists those 30 operation ids. Both halves come from this one file, so a refresh moves both.

The operation-id list is an allow-list, and an id matching no operation throws rather than
quietly keeping nothing, so a canonical rename fails the build instead of shrinking the SDK.

`@epcc-sdk/sdks-shopper` emits the same 21 admin paths from the same spec. The overlap is
deliberate and the two agree: shopper carries them because they are in the join, and
`sdks-catalogs` is the standalone package for them.

If you see `/pcm/catalogs` used elsewhere and wonder which is right: both forms reach the same
operations, and these packages follow the published spec, which declares `/catalogs`. Do not
add a path prefix here to match some other client.

## `settings.yaml`

Not a divergence — it is a plain copy of canonical and stays refreshable. It is listed here
because the refresh **removes two operations**, and the reason that is safe lives in another spec.

Our copy carried `/v2/settings/cart` with `get-v2-settings-cart` and `put-v2-settings-cart`, plus a
`SettingsCart` schema. Canonical's settings spec has none of them, and its `info.description` does
not mention cart settings at all. The endpoint is not gone: canonical documents it in the **carts**
spec, which `cart_checkout.yaml` copies byte for byte, along with a `/v2/settings/cart/{storeID}`
variant our settings copy never had. `@epcc-sdk/sdks-cart-checkout-order` and
`@epcc-sdk/sdks-shopper` already export `getV2SettingsCart` and `putV2SettingsCart` from it, under
the same operation ids.

The copy here was stale, not additional. Its `SettingsCart` stops at `cart_expiry_days` and
`discounts`; the carts one also has `id`, `inventories.defer_inventory_check`,
`items.separate_items_by_location` and `show_all_carts`. A caller of `putV2SettingsCart` from
`@epcc-sdk/settings` could not type any of those. Keeping it would publish two `SettingsCart` types
under two package names, one of them permanently behind the API.

So it is dropped deliberately. An import of `getV2SettingsCart` or `putV2SettingsCart` from
`@epcc-sdk/settings` moves to `@epcc-sdk/sdks-cart-checkout-order` or `@epcc-sdk/sdks-shopper`.

Two further changes the export diff cannot see, because no export name moves:

- `Settings` gains `shopper_address_limit`, and `SettingsData.data` gains `id`,
  `include_organization_resources`, `cart_item_limit` and `custom_discount_limit`. Additive.
- `_Error.status` is retyped from a required `string` to an optional `number`, and `_Error` gains
  `code` and `source`. That changes `ErrorResponse` for every operation in the package. Canonical's
  own response examples in the same file still show `"status": "500"` as a string, so the schema and
  the examples there disagree; the generated type follows the schema.
