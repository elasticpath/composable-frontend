---
"@elasticpath/catalog-search-instantsearch-adapter": minor
---

Add a typed `include` configuration option that forwards to the underlying
`postMultiSearch` call as the `?include=` URL query parameter. When set, EP
returns a top-level `included` block alongside hits — letting the consumer
inline `main_image`, `files`, or `component_products` resources without an
extra round-trip.

```ts
new CatalogSearchInstantSearchAdapter({
  client,
  additionalSearchParameters: { query_by: "name,description" },
  include: ["main_image"],
})
```

Behaviour is fully backward-compatible: when `include` is unset (or an empty
array), the adapter does not add a `query` field to the SDK call and the
request shape is byte-for-byte identical to before.
