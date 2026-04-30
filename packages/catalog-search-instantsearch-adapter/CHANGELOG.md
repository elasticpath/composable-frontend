# @elasticpath/catalog-search-instantsearch-adapter

## 0.1.0

### Minor Changes

- 7698039b: Add a typed `include` configuration option that forwards to the underlying
  `postMultiSearch` call as the `?include=` URL query parameter. When set, EP
  returns a top-level `included` block alongside hits, and the adapter resolves
  each hit's `relationships.<resource>.data` references against that block —
  inlining `main_image`, `files`, and/or `component_products` records directly
  onto the hit so consumers can render rich content without a separate
  round-trip per hit (or per page batch via `/catalog/products?filter=in(id,…)`).

  ```ts
  new CatalogSearchInstantSearchAdapter({
    client,
    additionalSearchParameters: { query_by: "name,description" },
    include: ["main_image"],
  })

  // hit.main_image is now the full record with link.href, mime_type, etc.
  ```

  `main_image` resolves to a single record; `files` and `component_products`
  resolve to arrays whose order follows the hit's `relationships.<resource>.data`
  order. Missing references are skipped silently. If the server omits the
  `included` block entirely while `include` was requested, the adapter logs a
  single `console.warn` per instance to flag the server-side mismatch.

  Behaviour is fully backward-compatible: when `include` is unset (or an empty
  array), the adapter does not add a `query` field to the SDK call and the
  request shape — and resulting hit shape — is byte-for-byte identical to before.

### Patch Changes

- Updated dependencies [d6f7aa3b]
  - @epcc-sdk/sdks-shopper@0.0.43

## 0.0.5

### Patch Changes

- Updated dependencies [ee7e9c7]
  - @epcc-sdk/sdks-shopper@0.0.42

## 0.0.4

### Patch Changes

- 45b5119: Bug fix in build to fix imports

## 0.0.3

### Patch Changes

- 674ed5b: Updated readme

## 0.0.2

### Patch Changes

- 0ef1441: Make package public

## 0.0.1

### Patch Changes

- 018ec4f: - Shopper SDK support for catalog search
  - Instant search support for catalog search
- Updated dependencies [018ec4f]
  - @epcc-sdk/sdks-shopper@0.0.41
