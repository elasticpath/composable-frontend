---
"@epcc-sdk/sdks-pricebooks": minor
---

Regenerate the pricebooks SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2).

- The fetch client is now vendored into the package (`client/`, `core/`), so
  `@hey-api/client-fetch` is no longer a runtime dependency. `createClient`,
  `createConfig`, the shared `client` instance and the `Client`, `Config`,
  `CreateClientConfig`, `RequestOptions` and `RequestResult` types are exported
  from the package root.
- The shared `client` instance now carries a default base URL,
  `https://euwest.api.elasticpath.com`, taken from the server list in the
  specification. It previously had none, so a request went to a relative URL and
  a same-origin proxy could pick it up. A consumer who does not want this default
  must pass `baseUrl` explicitly, through `createPricebooksClient`,
  `createClient`, `client.setConfig` or the `baseUrl` option on a single
  operation.
- `CreateClientConfig` is now re-exported from the generated client rather than
  the vendored generic one. The generated declaration defaults its type
  parameter to this specification's `ClientOptions`, so it matches the type the
  package's own client is built with. The values a consumer can pass do not
  change, because that union ends in `(string & {})` and still accepts any
  string.
- Timestamp fields are typed as `string` and `int64` fields (including
  `page[limit]`, `page[offset]` and `amount`) as `number`, matching the values
  the API actually returns. The `@hey-api/transformers` plugin is no longer
  enabled.
- Generated Zod schemas (zod v3 syntax) are available from the new
  `@epcc-sdk/sdks-pricebooks/zod` subpath. `zod` is an optional peer
  dependency; the root entry does not import it.
- Inline enum types `Include`, `ModifierType` and `Type` are no longer exported
  (the `exportInlineEnums` option does not exist in 0.99).
