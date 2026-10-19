# @epcc-sdk/sdks-catalogs

## 0.5.0

### Minor Changes

- fc0a55b2: `@epcc-sdk/sdks-catalogs` now includes the 16 shopper catalog operations under `/catalog`, the reads a storefront makes, chosen by catalog rules from the shopper's context: `getByContextRelease`, the `getByContext*` hierarchy, node and product reads, and `configureByContextProduct`. Each has an SDK function and an MCP tool, so `tools()` now returns 46. Nothing existing changes.

### Patch Changes

- 7cd1177c: The copied MCP support file gains the helpers that decode `data:` URI uploads. The generated tools are unchanged.

## 0.4.1

### Patch Changes

- 64f86d08: `@epcc-sdk/sdks-catalogs/mcp`: each of the 30 tools now has a short description written for a model choosing between tools, at most 600 characters, in place of the operation's full spec description. The full spec description stays in the doc comment of the function and its tool factory. One title changes: `catalogs_get_hierarchy_child_nodes` is now "Get a Hierarchy's Top-Level Nodes".

## 0.4.0

### Minor Changes

- d5ab0184: `@epcc-sdk/sdks-catalogs` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 30 operations, such as `getCatalogsTool`, and `tools()`, which returns all 30. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency. The main entry does not change.

## 0.3.0

### Minor Changes

- 349317cf: The `/zod` export now generates Zod 4 schemas, and each schema carries its description from the spec. `z.toJSONSchema()` includes those descriptions.

  The `zod` peer dependency moves from `^3.22.0` to `^4.0.0`. Upgrade `zod` to 4 and upgrade every `@epcc-sdk` package that has a `/zod` export at the same time. The packages cannot share one install of zod while their peer ranges are on different majors. The SDK functions and types do not change.

  Zod 4 validates `format: uuid` fields strictly. A value whose version or variant digits do not follow RFC 9562 now fails to parse, although Zod 3 accepted it. Validation errors use Zod 4's issue format. For example, a missing enum value is reported as `invalid_value` where Zod 3 reported `invalid_type`.

  `@epcc-sdk/sdks-nextjs` accepts `@epcc-sdk/sdks-shopper` 0.8 as a peer dependency, as well as 0.7.

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
