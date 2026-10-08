# @epcc-sdk/sdks-pxm

## 0.3.0

### Minor Changes

- 932584b6: Regenerate from the upstream `pim` spec (spec version 26.0924.8211771, published 2026-09-24T10:27:11Z).

  Adds 7 exported symbols.

## 0.2.0

### Minor Changes

- dad4d32a: Regenerate the Product Experience Manager SDK with `@hey-api/openapi-ts` 0.99.0 (previously
  0.61.2), add `createPxmClient`, and publish the Zod schemas. The package still generates
  straight from the checked-in specification, which is unchanged.

  What is new:

  - `createPxmClient` binds the generated `createClient` and `createConfig` to
    `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
    token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
    backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
    replay cannot duplicate work.

    ```ts
    const client = createPxmClient({
      baseUrl: "https://euwest.api.elasticpath.com",
      clientId: process.env.EPCC_CLIENT_ID!,
      clientSecret: process.env.EPCC_CLIENT_SECRET!,
    })
    ```

    Credentials are resolved from `source`, `provider`, `token`, `clientId` plus
    `clientSecret`, or `clientId` alone for the implicit grant. `retry`, `storage`,
    `leewaySeconds`, `fetch` and `config` tune the rest; `config` is merged last, so
    anything the factory chose can be overridden. The runtime helpers are re-exported from
    the package root, so a consumer who assembles the stack by hand still installs only this
    package.

  - Zod schemas for every request body, path, query and response are generated and exposed on
    the `@epcc-sdk/sdks-pxm/zod` subpath. `zod` is an optional peer dependency (3.x) and the
    root entry never imports it. The schemas coerce the `page[offset]` and `page[limit]` query
    parameters listed under "What is fixed" to `bigint` (`z.coerce.bigint()`, bounded to 0
    through 10000), as the zod plugin does for every `int64`, so a parsed query carries
    `bigint` where the TypeScript types say `number`.

  Breaking in practice, although the version is a minor:

  - The `@hey-api/client-fetch` dependency is gone. The fetch client is vendored into
    `src/client/{client,core}`, and the root entry exports `createClient`, `createConfig`,
    the shared `client` instance and the `Client`, `Config`, `CreateClientConfig`,
    `RequestOptions` and `RequestResult` types. Import those from this package instead of
    from `@hey-api/client-fetch`, which is deprecated.
  - The shared `client` instance now carries a default base URL of
    `https://euwest.api.elasticpath.com`; before, it had none. The specification already
    lists EU West first; the region is set in the generator config as well, so a refresh
    that reorders the servers cannot change it. The base URL is the host: every path in this
    API starts with `/pcm/`.
  - The 32 `date-time` fields are typed `string`, not `Date`. By resource, with the operations
    whose responses carry them:

    - Jobs: `started_at`, `completed_at`, `created_at` and `updated_at` on
      `Job["attributes"]`, in `getAllJobs`, `getJob`, `cancelJob`, `importProducts`,
      `exportProducts`, `buildChildProducts` and `duplicateHierarchy`.
    - Products: `created_at` and `updated_at` on `ProductResponse["meta"]`, in
      `createProduct`, `getAllProducts`, `getProduct`, `updateProduct`, `getChildProducts`,
      `getNodeProducts` and `getRelatedProductsOfAProductId`.
    - Product associations: `created_at` and `updated_at` in
      `ProductAssociationResponse["meta"]["timestamps"]`, in `productAssociationId`.
    - Files: `created_at` on each file's `meta` in `FileResponse`, in
      `getProductFileRelationships`.
    - Variations: `created_at` and `updated_at` on each variation's `meta` in
      `MultiVariations` and `CreatedVariation`, and on each option under `meta.options` in
      `MultiVariations` and `SingleVariation`; `created_at` on each variation's `meta` in
      `VariationsResponse`. They reach `createVariation`, `getAllVariations`, `getVariation`,
      `updateVariation` and `getProductVariationRelationships`.
    - Variation options: `created_at` and `updated_at` on each option's `meta` in
      `MultiOptions`, `CreatedOption` and `SingleOption`, in `createVariationOption`,
      `getAllVariationOptions`, `getVariationOption` and `updateVariationOption`.
    - Hierarchies: `created_at` and `updated_at` on `Hierarchy["meta"]`, in
      `createHierarchy`, `getHierarchy`, `getHierarchyChild`, `updateHierarchy`,
      `createHierarchyChildRelationships` and `getAllNodes`.
    - Nodes: `created_at` and `updated_at` on `Node["meta"]`, in `createNode`,
      `getHierarchyNode`, `updateNode`, `getAllNodesInHierarchy`, `getAllNodes`,
      `getAllChildren`, `getAllNodeChildren`, `createNodeChildRelationships`,
      `createNodeProductRelationship`, `deleteNodeProductRelationships` and
      `getProductsNodes`.
    - Tags: `created_at` and `updated_at` on `Tag["meta"]`, in `getAllProductTags` and
      `getProductTag`.
    - Custom relationships: `created_at` and `updated_at` in
      `CustomRelationship["meta"]["timestamps"]`, in `createCustomRelationship`,
      `getCustomRelationships`, `getCustomRelationship`, `updateCustomRelationship`,
      `attachCustomRelationships` and `listAttachedCustomRelationship`.

    That is 49 operations. The old `@hey-api/transformers` plugin declared these fields
    `Date`, but no operation called its transformer, so the value at runtime was always the
    string the API sends. Code that called a `Date` method on one of these fields stops
    compiling; wrap the value in `new Date(...)` where you need one. No request body carries
    a `date-time`.

  - `_Error` is renamed to `Error`. Rename the import; the shape is unchanged.
  - The inline enum types `CommodityType`, `Default`, `Locale`, `Owner`, `Status` and `Type`
    are no longer exported, because the `exportInlineEnums` option does not exist in 0.99.
    Their unions are unchanged and are now written inline at each use site. Replace a
    reference with the literal union, or derive it:
    `NonNullable<ProductAttributes["commodity_type"]>`,
    `NonNullable<ProductBuildRules["default"]>`,
    `NonNullable<NonNullable<ImportProductsData["query"]>["locale"]>`,
    `NonNullable<NonNullable<ProductResponse["meta"]>["owner"]>`,
    `Job["attributes"]["status"]` and `Job["type"]` (the old `Type`, `"pim-job"`).
  - The items of `getAllNodes`' response (`NodesOrHierarchies["data"]`) are written
    `Node | Hierarchy` instead of each variant intersected with its discriminator literal.
    `Node` and `Hierarchy` each declare their own `type` literal, so a check on `type` still
    narrows to the variant; nothing changes at a call site.

  What is fixed:

  - The 32 `int64` fields are typed `number`, not `BigInt`: `PageOffset`, `PageLimit`, and the
    `page[offset]` and `page[limit]` query parameters of the 15 list operations that take them
    (`getAllProducts`, `getProductsNodes`, `listAttachedCustomRelationship`,
    `getRelatedProductIdsOfAProductId`, `getRelatedProductsOfAProductId`, `getAllVariations`,
    `getAllVariationOptions`, `getAllModifiers`, `getHierarchy`, `getAllNodes`,
    `getAllNodesInHierarchy`, `getAllChildren`, `getAllNodeChildren`, `getNodeProducts` and
    `getCustomRelationships`). The old `transformers.gen.ts` declared them `BigInt`, but no
    operation called it, so the values at runtime were always numbers and the declared types
    were wrong. A caller that passed a `bigint` such as `10n` must pass a `number`.

  All 82 operations keep their names and their `Data` / `Response` / `Error` types.
  `ClientOptions`, the known base URL union, is new; apart from the changes listed above,
  nothing in the exported type surface is renamed or removed, no property is dropped, and no
  property gains a `readonly` modifier: the specification marks nothing `readOnly`, so the
  generator's read/write split produces no `*Writable` types here.

## 0.1.1

### Patch Changes

- 4cbd8efe: Regenerate from the upstream `pim` spec (spec version 26.0704.7853188, published 2026-07-04T10:11:15Z).

## 0.1.0

### Minor Changes

- a363b78d: Add support for shopper and admin attributes, bundle quantity configuration, and selective column export on products.

  - New `ShopperAttributes` and `AdminAttributes` types (string→string maps, max 100 keys) on products, hierarchies and nodes. `shopper_attributes` are catalog-visible; `admin_attributes` are admin-only.
  - Product list/export endpoints now accept filters using `eq(shopper_attributes.<key>,…)` and `eq(admin_attributes.<key>,…)`.
  - Product import (CSV) supports `shopper_attributes.<key>` / `admin_attributes.<key>` columns, partial updates, and the `__REMOVE_ATTRIBUTE__` sentinel for deleting a key.
  - Product export request body supports `data.attributes.columns.include` to cherry-pick exported columns (including wildcards like `admin_attributes.*`).
  - Bundle component options now expose per-option `min` / `max` to configure shopper-selectable quantities.
  - Multi-product responses now include a `links` object (typed via the new `multi_links` schema).

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

- 5c8d75a: Update to latest pxm spec

## 0.0.4

### Patch Changes

- 1c3586d: Remove version from README

## 0.0.3

### Patch Changes

- 6324423: Add README sdks

## 0.0.2

### Patch Changes

- 0496e87: init release of next gen sdks
