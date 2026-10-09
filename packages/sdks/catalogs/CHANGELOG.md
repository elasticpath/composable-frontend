# @epcc-sdk/sdks-catalogs

## 0.2.0

### Minor Changes

- b1c89251: The `/zod` schemas parse `int64` values as `number`, the type the TypeScript types already use, instead of `bigint`. A value validated with the schema can now be passed straight to the operation or field that takes it.

  - `z.coerce.bigint()` becomes `z.number().int()` behind a step that turns a string into a number, so a query string value such as `"20"` still parses, to `20`.
  - The bounds the specification declares stay, as plain numbers. The 64-bit range of the format itself is no longer emitted, because a `number` cannot hold it.
  - No `BigInt(…)` is left in the generated schemas.

  The TypeScript types, the SDK functions and the exported names do not change.

  Breaking in practice, although the version is a minor:

  - `.parse()` returns a `number` where it returned a `bigint` for `zAmount`, `zPageMeta`, `zBundleConfiguration`, `zReleaseMeta`, `zTieredAmount`, `zLimit`, `zOffset`, `zGetCatalogsQuery`, `zGetRulesQuery`, `zValidateCatalogRulesQuery`, `zGetAllHierarchiesQuery`, `zGetHierarchyNodesQuery`, `zGetHierarchyChildNodesQuery`, `zGetAllNodesQuery`, `zGetChildNodesQuery`, `zGetComponentProductIdsQuery`, `zGetAllProductsQuery`, `zGetAllRelatedProductsQuery`, `zGetChildProductsQuery`, `zGetProductsForHierarchyQuery` and `zGetProductsForNodeQuery`, and for the schemas built from them. Code that compared the result with a `bigint` literal such as `20n`, or did `bigint` arithmetic on it, needs to use numbers.
  - Responses are affected too: `.parse()` of a response now returns `number` for price `amount` values, the `total`, `limit`, `offset` and `current` page values, the quantities in a bundle's `selected_options`, and a release's `total_products`, `total_nodes` and `indexing_duration_ms`.
  - Only strings are converted. A boolean is rejected, where `z.coerce.bigint()` turned `true` into `1n` and `false` into `0n`. `null` on a required field is still rejected.
  - `z.input` of the affected schemas is now `unknown`, because `z.preprocess` in Zod v3 types its input that way.

## 0.1.0

### Minor Changes

- 5cb6f535: Add `@epcc-sdk/sdks-catalogs`, a generated client for the admin catalogs API.

  It covers all 30 operations under `/catalogs`: catalogs and catalog rules, release
  publishing, and the hierarchies, nodes and products inside a release. Like
  `@epcc-sdk/sdks-pricebooks`, it bundles `@epcc-sdk/sdks-runtime`, so `createCatalogsClient`
  gives you a client that holds a token, refreshes it on a 401 and backs off on a 429 from one
  install. Zod schemas are on the `/zod` subpath so the main entry never imports zod.

  The operations come from `specs/catalog_view.yaml`, which carries both the shopper catalog view
  and the admin catalogs API; `catalogs@v1` in `specs/config/redocly.yaml` selects the admin half.
  `@epcc-sdk/sdks-shopper` is unchanged.
