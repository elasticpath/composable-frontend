# @epcc-sdk/authentication

## 0.1.0

### Minor Changes

- a45053f3: Regenerate the authentication SDK with `@hey-api/openapi-ts` 0.99.0 (previously
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

  Correct two defects in `packages/sdks/specs/authentication.yaml`, confirmed
  against a live store and against the canonical specification.

  - The 200 response is now the flat `AccessTokenResponse`. This is a breaking
    change for anyone who reads it. It was declared as
    `{ data?: AccessTokenResponse }`, but the token endpoint returns
    `access_token`, `identifier`, `expires`, `expires_in` and `token_type` at the
    top level with no wrapper, so the old type was wrong and a consumer following
    it read `undefined`. `CreateAnAccessTokenResponses[200]` and
    `CreateAnAccessTokenResponse` are now `AccessTokenResponse`. Replace
    `result.data?.data?.access_token` with `result.data?.access_token`. Code that
    already worked around the wrapper at run time will now fail to compile, which
    is the point: the fix is to delete the workaround. The response example in the
    specification was corrected to match.

## 0.0.3

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.2

### Patch Changes

- 77a4840: add index for exporting auth sdk

## 0.0.1

### Patch Changes

- e5fbcf1: Release missing sdks
