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
- `createAnAccessToken` now returns a `RequestResult` and takes the generated
  `Options` type, which is also exported. The `ClientOptions` type (the list of
  known base URLs) is new.
- The `_Error` type is no longer exported. The generator now emits the same
  schema as `Error`, so replace `import type { _Error }` with
  `import type { Error }`. It shadows the global `Error` type at the import
  site, so alias it if that matters.
