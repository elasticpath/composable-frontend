---
"@epcc-sdk/authentication": minor
---

Regenerate the authentication SDK with `@hey-api/openapi-ts` 0.99.0 (previously
0.61.2).

- The fetch client is now vendored into the package (`client/`, `core/`), so
  `@hey-api/client-fetch` is no longer a runtime dependency. The package now has
  no runtime dependencies at all. `createClient`, `createConfig`, the shared
  `client` instance and the `Client`, `Config`, `CreateClientConfig`,
  `RequestOptions` and `RequestResult` types are exported from the package root.
- The shared `client` instance now carries a default base URL,
  `https://useast.api.elasticpath.com`, taken from the server list in the
  specification. It previously had none, so a request went to a relative URL and
  a same-origin proxy could pick it up. A consumer who does not want this default
  must pass `baseUrl` explicitly, through `createClient`, `client.setConfig` or
  the `baseUrl` option on a single operation.
- `CreateClientConfig` is now re-exported from the generated client rather than
  the vendored generic one. The generated declaration defaults its type
  parameter to this specification's `ClientOptions`, so it matches the type the
  package's own client is built with. The values a consumer can pass do not
  change, because that union ends in `(string & {})` and still accepts any
  string.
- `createAnAccessToken` now returns a `RequestResult` and takes the generated
  `Options` type, which is also exported. The `ClientOptions` type (the list of
  known base URLs) is new.
- The `_Error` type is no longer exported. The generator now emits the same
  schema as `Error`, so replace `import type { _Error }` with
  `import type { Error }`. It shadows the global `Error` type at the import
  site, so alias it if that matters.
