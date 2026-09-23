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
join needs, so that package keeps `Timestamps` unprefixed. `@epcc-sdk/sdks-cart-checkout-order`
runs that bundle itself, in its own `oas:build`, so it depends on nothing else to produce its
input. Every package that generates from `bundled/` does the same, and no two of them write
the same file.

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

## `authentication-realms.yaml`

Not a copy of canonical (`single-sign-on/OpenAPISpec.yaml`) and marked `needs-triage` in
`config/canonical-map.json`, so the sync never touches it. Paths and `type` values follow the
service, `external-authentication.svc`. Its controllers serve `oidc-profiles`, and nest
`user-authentication-oidc-profile-info` under
`user-authentication-info/{userAuthenticationInfoId}`. Its read and request data classes use
`type: authentication-realm` and `type: oidc-profile`, and the request validators reject any
other value. Until this was corrected, our spec used `openid-connect-profiles`, a realm-level
`user-authentication-openid-connect-profile-info`, `authentication_realm` and
`openid_connect_profile`, all hand-written in #359 and never checked. The gateway has no route
for either path, so those SDK functions returned 404, and the realm and OIDC profile schemas
rejected every live response. This was verified against the live API.

Do not copy `authentication_realm` from `account_management.yaml`. The account-management
service does send that spelling in the `authentication_realm` relationship of
`/v2/settings/account-authentication`. The realms service spells its own resource
`authentication-realm`. Canonical is not a reliable source either: it spells the one-time
password type `one-time-password-token-request`, and the service requires
`one_time_password_token_request`.

Schema and operation names are still our own. `*OidcProfile*` and `*OIDCProfileInfo*` keep
their names, so no export changed. Our operationIds are our own too — `getAllUserAuthenticationInfo`
rather than canonical's `get-v2-authentication-realms-realmId-user-authentication-info`.

Everything else about the resources is meant to track canonical, and the
`user-authentication-info` resource did not. It was modelled on its sibling
`user-authentication-password-profile-info` and carried that schema's `username`. The real
resource has `name` and `email`. Corrected in #606: `UserAuthenticationInfo` and both request
wrappers now mirror canonical's `UserAuthenticationInfo` and `UserAuthenticationInfoResponse`
field for field, and the collection carries the `page[limit]`, `page[offset]`, `filter` and
`sort` parameters it always accepted.

One thing there is deliberately **not** canonical. Canonical models the PUT body as a whole
`UserAuthenticationInfo`, `required: [type, name, email]`. The service does a partial update:
`UserAuthenticationInfoUpdateData` puts `@NotBlank` on `type` alone, and
`UserAuthenticationInfoServiceImpl.updateUserAuthenticationInfo` guards every field with a
null check. Its `id` field is never read — the id comes from the path. So the update wrapper
requires `type` only. Verified against `external-authentication.svc` at `origin/main`, the
service that serves these endpoints; check there before trusting canonical on this resource.

Do not reintroduce `username` on a `user_authentication_info` schema. It is correct on
`UserAuthenticationPasswordProfileInfo`, `UserAuthenticationOIDCProfileInfo`,
`PasswordProfileInfo` and `OneTimePasswordTokenRequest`, and wrong everywhere else.

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

## `payments.yaml`

Not a divergence — it is a plain copy of canonical and refreshable. It is listed here because
the refresh that makes it one **removes eight exports from a published package**, and the
reason for accepting that should not have to be re-derived.

Our copy was added wholesale on 2025-03-07 in #322 and never edited since. What it holds that
canonical no longer does is the retired **Stripe Connect** gateway:

| | Ours | Canonical |
| --- | --- | --- |
| `PUT /v2/gateways/stripe_connect` (`updateStripeConnectGateway`) | present | gone |
| `Data.UpdateStripeConnectGateway`, `Request.UpdateStripeConnectGateway` | present | gone |
| `Data.ElasticPathPaymentsStripeGateway` | absent | present |
| `getAGateway` `gatewaySlug` enum | includes `stripe_connect` | does not |

`elastic_path_payments_stripe` is the successor and takes the same body. The evidence is in our
own spec: `Request.UpdateElasticPathPaymentsStripeGateway` `$ref`s `Data.UpdateStripeConnectGateway`,
the Stripe Connect payload. Canonical gives that object its own name, `Data.ElasticPathPaymentsStripeGateway`,
with `stripe_account` redescribed from "Stripe Connect account ID" to "Stripe account ID". The two
operations were sharing one schema because the payloads are identical; canonical kept the schema,
renamed it and dropped the gateway.

`stripe_connect` appears nowhere in canonical payments or canonical carts, and
`developer.elasticpath.com` no longer lists a Stripe Connect page among the gateway endpoints.
Keeping a client function for it would advertise an endpoint Elastic Path does not document.

This is a different call from the one #579 made about `Data.StripeConnectPayment` in
`cart_checkout.yaml`. That schema is a member of the four-way cart-item union our published
SDKs expose, kept so an existing response type does not change shape — not a claim that the
gateway is still configurable.

Nothing in this repo imports `@epcc-sdk/payments`, `shopperJoin` is false, and the spec feeds no
redocly bundle: `packages/sdks/payments/openapi-ts.config.ts` reads `../specs/payments.yaml`
directly. So the blast radius is the published package alone. A consumer calling
`updateStripeConnectGateway()`, or importing any of the seven types around it, must move to
`updateEpPaymentsStripe()` and `DataElasticPathPaymentsStripeGateway`. `GatewaySlug` also narrows
by one member, so `"stripe_connect"` stops typechecking as a `getAGateway` path parameter.

The sync workflow does not hide this: `sync-spec.mjs` derives a breaking bump from the export
diff, writes it into the changeset, and the workflow holds the pull request as a draft with the
removed names listed.

## `catalog_search.yaml`

Now refreshable from canonical, with the operation selection in `config/redocly.yaml`. The
checked-in spec was never a curated subset, and the note that called it one was wrong.

It is the catalog-search service's own OpenAPI file as it stood before the API was published:
`info.title: catalog-search`, `version: 1.0.0`, and four Kubernetes probe operations under
`/checks/readiness` and `/checks/healthz`. #455 pasted it in and then hand-edited the one real
operation's path over three commits — `/pcm/catalog/multi_search` to `/catalog/multi_search`
(a15630d4) to `/catalog/multi-search` (b5fd5b48). Those two edits are the only deliberate
decisions in the file's history; the 5-operation shape is what the pasted file happened to
contain, not a choice anyone made.

The four probes carry `x-internal: true`, which the global `remove-x-internal` decorator
strips, so the published surface of `@epcc-sdk/sdks-catalog-search` is, and has only ever
been, `postMultiSearch`. #505 says so in as many words.

Canonical publishes 40 operations: the two shopper ones (`postMultiSearch`, `searchByContext`)
and 38 admin ones for indexable fields, search profiles, stopword and synonym sets, search
rules and indexes. Copying it verbatim **fails the shopper join** — seven conflicts against
specs already in it:

| Kind | Name | Conflicts with |
| --- | --- | --- |
| tag | `Jobs` | `subscriptions` |
| schema | `Job`, `JobAttributes`, `JobMeta` | `subscriptions` |
| parameter | `accept-language` | `catalog_view` |
| parameter | `pricebook-ids-for-price-segmentation-preview` | `catalog_view` |
| parameter | `pricebook-ids-of-available-prices-to-show` | `catalog_view` |

`catalog_search@v1` therefore carries three things. `filter-operations-by-extension` with a
one-id allow-list, `postMultiSearch`, which keeps the 38 admin operations out of both packages
and out of the shopper join; an id matching no operation throws rather than quietly keeping
nothing, so a canonical rename fails the build instead of emptying the SDK. `prefix-components`
gains `parameters` as a target and the six colliding names. `prefix-tags` takes `Jobs`.

With that in place a refresh builds, `@epcc-sdk/sdks-shopper` still exposes 150 `export const`
in `sdk.gen.ts`, `@epcc-sdk/sdks-catalog-search` still exposes one operation, and no export is
removed from either. It adds 125 types to `sdks-catalog-search` and 122 to `sdks-shopper`:
canonical's admin schemas stay in the bundle even once their operations are filtered out, the
same way inventories' import-job schemas do. `remove-unused-components` does not drop them.

The eleven schemas both files define — `AutocompleteResponse`, `Error`, `ErrorResponse`,
`FacetCount`, `FacetValue`, `Hit`, `MultiSearchRequest`, `MultiSearchResponse`, `Product`,
`SearchQuery`, `SearchResult` — are compatible. `Product` is identical. The rest only gain
fields (`SearchQuery.sort_by`, `SearchResult.matched_rules`, `Hit.text_match_info`,
`MultiSearchResponse.included`) or move an inline enum behind a `$ref`. Canonical drops
`page[limit]` and `page[offset]` from `postMultiSearch` and adds `search-profile` and
`simulated-shopper-date`.

**Check the path before merging the first refresh.** Canonical serves this operation at
`/pcm/catalog/multi-search` with a `/v2` server base; ours has said `/catalog/multi-search`
since #455, and that is the URL `sdk.gen.ts` emits today in both packages. A refresh changes
it, and nothing in this pipeline can see that: no export moves, the example typecheck passes,
and the changeset reads as a plain `minor`. The catalog_view note above records that
`/pcm/catalogs` and `/catalogs` both reach the same operations, so the two forms here are
probably aliases too — but that was established for a different service, and the adapter,
`examples/spa-search`, `examples/spa-search-instantsearch` and `examples/core` all call this
one operation. Confirm against a live store, then merge.

`searchByContext` is canonical's other shopper operation and is not on the allow-list. Adding
it is a one-line change and a deliberate one; this triage kept the surface as published.

## `permissions.yaml`

Not a divergence — it is a plain copy of canonical and refreshable. It is listed here for the
one thing that blocks a refresh.

Canonical has retired Built-in Roles. `GET /v2/permissions/built-in-roles` and
`GET /v2/permissions/built-in-roles/{built_in_role_id}` are gone, replaced by Standard User
Roles and Standard Shopper Roles under `/v2/permissions/standard-user-roles` and
`/v2/permissions/standard-shopper-roles`, each with a list and a get. The spec checked in
before #583's triage was the March 2025 snapshot, never hand-edited, so nothing of ours was
lost by taking canonical whole. Nothing in `packages/` or `examples/` imports this package, and
it is not one of the eleven specs joined into `@epcc-sdk/sdks-shopper`.

`openapi-ts.config.ts` names one operation for the README examples, and the readme generator
throws on a name it cannot find rather than skipping the section. It pointed at
`getABuiltInRole`, so the refresh failed in the generator, not in the export diff. It now points
at `getAStandardUserRole`. Any spec whose refresh retires the named operation will fail the same
way; repoint it rather than removing the plugin.

Canonical also renames the path template variables from `snake_case` to `kebab-case`. The
request URL is unchanged, but the `path` key in the generated `*Data` types is not:
`custom_api_role_policy_id` becomes `custom-api-role-policy-id`.

## `rule-promotions.yaml`

Not a divergence — it is refreshable from canonical (`promotions-builder/OpenAPISpec.yaml`) and
`divergence` is now `none`. It is listed here because the refresh is **breaking**, and the reason
is not obvious from the export diff.

The sampling note read "ours is missing job operations canonical has added". We are not missing
them. Both specs carry the same ten paths, including all four job paths. What ours lacks is the
`operationId` on the four job operations:

| Path | Method | Canonical `operationId` | What hey-api names it from our spec |
| --- | --- | --- | --- |
| `/v2/rule-promotions/{uuid}/jobs` | post | `createRulePromotionJob` | `postV2RulePromotionsByUuidJobs` |
| `/v2/rule-promotions/{uuid}/jobs` | get | `getRulePromotionJobs` | `getV2RulePromotionsByUuidJobs` |
| `/v2/rule-promotions/{uuid}/jobs/{job-uuid}/file` | get | `getRulePromotionJobFile` | `getV2RulePromotionsByUuidJobsByJobUuidFile` |
| `/v2/rule-promotions/{uuid}/jobs/{job-uuid}/cancel` | post | `cancelRulePromotionJob` | `postV2RulePromotionsByUuidJobsByJobUuidCancel` |

So the refresh **renames** four exported functions rather than adding them, and takes their
generated `*Data` / `*Responses` / `*Errors` types with them: 20 of the 25 removed exports are
that one rename. The operation count does not move — 16 before, 16 after. The path-derived names
were never chosen; they are what the generator falls back to when an operation has no id, so
following canonical is the right call and the rename is the cost of it.

The other five removals are canonical having restructured the same shapes:

| Removed | Canonical equivalent |
| --- | --- |
| `RulePromotionRequest` | `RulePromotionItem` (`RulePromotionBaseAttributes & RulePromotionBaseRuleSetBaseAttributes`) |
| `PromotionJobCreatedResponse` | `PromotionJobResponse` |
| `PromotionJobCanceledResponse` | `PromotionJobResponse` |
| `ResponsePaginationMeta` | `PaginationMeta` |
| `Type` | inlined as the `"rule_promotion"` literal on `RulePromotionItem` |

Nothing of ours is lost. The one hand edit this spec has ever carried — `max_units` under a
rule-promotion action's item limitations, added in #508 — is in canonical verbatim, description
and all. Canonical is otherwise a superset: it adds `account_id` to `RulePromotionUsage`, names
the condition and action schemas that ours left inline, and gives the three job response schemas
real bodies where ours declared them under `components.schemas` as response objects, which
hey-api could only render as `unknown`.

This spec feeds one package and nothing else. `@epcc-sdk/rule-promotions` generates straight from
the file, with no `config/redocly.yaml` entry, so no decorator applies to it; it is not one of the
eleven inputs to the shopper join, so its `PromotionJob` schemas cannot collide with the `Job`
families `subscriptions` and `inventories` contribute; and no package or example in this repo
imports it.

The request URLs do not move. Both specs declare the same two servers with no `/v2` suffix, both
carry `/v2` on every path, and `@hey-api/openapi-ts` 0.61.2 discards `servers` so the caller
supplies the host. All 16 generated `url:` values are byte-identical before and after.

## `account-addresses.yaml`

Not a divergence — it is refreshable from canonical, with the operation selection in
`config/redocly.yaml`. The note that blocked it said canonical used bare CRUD operation ids
against our descriptive kebab-case ones. That is wrong: canonical uses the same five kebab-case
ids (`get-v2-account-addresses`, `post-v2-account-address`, `get-v2-account-address`,
`put-v2-account-address`, `delete-v2-account-address`), over the same two paths, with the same
server entries. Nothing renames and no URL moves. The paths were also verified against the
service's own routes.

What does block a plain refresh is ours: the spec carries `x-sdk-filter: ['shopper']` on all
five operations and canonical does not. `account_addresses@v1` filtered on that marker alone,
so a refresh emptied the bundle — 0 operations — and `@epcc-sdk/sdks-shopper` would have gone
from 150 operations to 145 with five removed exports. Same pattern and same fix as
`inventories.yaml`: the five ids now live in `config/redocly.yaml` as an `operationIds`
allow-list, where a refresh cannot reach them, and the markers are gone from the spec. An id
matching no operation throws rather than quietly keeping nothing, so a canonical rename fails
the build instead of shrinking the SDK.

The one hand edit in this spec's history is already upstream. #347 moved
`post-v2-account-address` off `/v2/accounts/{accountID}/addresses/{addressID}` and onto
`/v2/accounts/{accountID}/addresses`; canonical declares it there too.

The refresh removes two exports from each package, `ErrorBadRequest` and `ErrorNotFound`. Both
are `export type ... = unknown` today and always have been: our copy files those two response
objects under `components.schemas`, where they are not schemas, so the generator has nothing to
emit. Canonical moves them to `components.responses`, which is where they belong, and the
generator inlines them into each operation's `*Errors` type instead. A consumer importing either
name gets `unknown`, so nothing typechecks differently; the names themselves disappear from
`@epcc-sdk/sdks-accounts-addresses` and `@epcc-sdk/sdks-shopper`.

Six exports are added to each: `PaginationLinks`, `PaginationMeta`, `PaginationPage`,
`PaginationResults`, `PageTotalMethod` and `TotalMethod`. Canonical adds pagination and filtering
to the list operation — `page[offset]`, `page[limit]`, `page[total_method]` and `filter` query
parameters, and `links`/`meta` on the 200 body. None of those names collide with the other ten
specs in the shopper join.

Three further changes the export diff cannot see, because no export name moves:

- `post-v2-account-address` gains a `201` response alongside its existing `200`, so
  `PostV2AccountAddressResponses` carries both.
- `Error.status` is retyped from `string` to `integer`, so the generated property goes `string` to
  `number`, which changes `ErrorResponse` for every operation in the package.
- `Address.type` moves from `default: address` to `const: address`, narrowing the property from
  `string` to the literal `"address"` on a request body callers construct.

## `application-keys.yaml`

Not a divergence — it is refreshable, and taking canonical fixes a response shape ours got
wrong. It is listed here for the rename consumers will see and for the one thing that blocks a
refresh.

The sampling note said only that the operationId naming differs. It does, and that is the whole
of the naming story: `getAllKeys`, `createKey`, `deleteKey`, `getKey` and `updateKey` become
`listApplicationKeys`, `createAnApplicationKey`, `deleteAnApplicationKey`,
`getAnApplicationKey` and `updateAnApplicationKey`. Five operations before, five after, and each
one maps 1:1 onto its canonical counterpart. The export count does not move: 43 before, 43
after. Ours was never hand-edited — it arrived whole in #322 — so the descriptive names were a
snapshot of an older canonical, not a choice of ours.

The substantive difference is `client_secret`. Ours declares one `ApplicationKeyResponse`
schema, carrying `client_secret`, and returns it from list, get, create and update. The service
returns the secret only from `POST /v2/application-keys`; on read and update the field is
omitted entirely. Verified against the service's own routes and its response builder, which is
handed the secret on create and `nil` everywhere else. Canonical models this correctly, adding
`client_secret` to the create response alone. So the refresh removes a field from three
response types that never carried a value, which is a correction rather than a loss.

Canonical also tightens the schemas: `name` gains `maxLength: 255` / `minLength: 1`,
`reserved_rate_limit` gains `minimum: 0`, `last_used_at` becomes nullable, pagination and self
links gain `format: uri` and a nullable type, and every operation gains explicit `400` and
`500` responses where ours had a `default`. The list operation's `401` becomes `400`/`500`.

The request URLs do not move. Both specs declare the same two servers, both carry `/v2` on
every path, and this spec has no `config/redocly.yaml` entry, so no path decorator applies. The
five routes match the service's own registration exactly. Canonical renames the path template
variable from `{application_key_id}` to `{application-key-id}`, which renames the `path` key in
the generated `*Data` types without changing a single request URL.

`openapi-ts.config.ts` names one operation for the README examples, and the readme generator
throws on a name it cannot find rather than skipping the section. It pointed at `getKey`, so
the refresh failed inside the generator rather than in the export diff. It now points at
`getAnApplicationKey` — the generator lowercases the first letter of the operationId, so the
name here is not canonical's `GetAnApplicationKey` verbatim.

Blast radius is one published package. Nothing in `packages/` or `examples/` imports
`@epcc-sdk/sdks-application-keys`, and the spec is not one of the eleven joined into
`@epcc-sdk/sdks-shopper`, which stays at 150 operations and 1538 exports with an identical
export set.
