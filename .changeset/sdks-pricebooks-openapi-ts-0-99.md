---
"@epcc-sdk/sdks-pricebooks": minor
---

Regenerate the pricebooks SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2).

- The fetch client is now vendored into the package (`client/`, `core/`), so
  `@hey-api/client-fetch` is no longer a runtime dependency. `createClient`,
  `createConfig`, the shared `client` instance and the `Client`, `Config`,
  `CreateClientConfig`, `RequestOptions` and `RequestResult` types are exported
  from the package root.
- Timestamp fields are typed as `string` and `int64` fields (including
  `page[limit]`, `page[offset]` and `amount`) as `number`, matching the values
  the API actually returns. The `@hey-api/transformers` plugin is no longer
  enabled.
- Generated Zod schemas (zod v3 syntax) are available from the new
  `@epcc-sdk/sdks-pricebooks/zod` subpath. `zod` is an optional peer
  dependency; the root entry does not import it.
- Inline enum types `Type` and `Include` are no longer exported (the
  `exportInlineEnums` option does not exist in 0.99).
