# @epcc-sdk/sdks-pricebooks

## 0.1.0

### Minor Changes

- c9196a1e: Regenerate the pricebooks SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2).

  - The fetch client is now vendored into the package (`client/`, `core/`), so
    `@hey-api/client-fetch` is no longer a runtime dependency. `createClient`,
    `createConfig`, the shared `client` instance and the `Client`, `Config`,
    `CreateClientConfig`, `RequestOptions` and `RequestResult` types are exported
    from the package root. `Client` is now a concrete type with no type
    parameters, so a consumer who wrote `Client<...>` with explicit type arguments
    must drop them.
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

- c9196a1e: Add `createPricebooksClient`, a bound convenience factory over
  `@epcc-sdk/sdks-runtime`. Install one package, call one function, and get a
  client with a caching token source, the `auth` hook and a `fetch` that refreshes
  and replays once on a 401 and backs off on a 429, a 408, and on a 5xx or a
  transport failure where a replay cannot duplicate work.

  ```ts
  const client = createPricebooksClient({
    baseUrl: "https://euwest.api.elasticpath.com",
    clientId: process.env.EPCC_CLIENT_ID!,
    clientSecret: process.env.EPCC_CLIENT_SECRET!,
  })
  ```

  Credentials are resolved from `source`, `provider`, `token`, `clientId` plus
  `clientSecret`, or `clientId` alone for the implicit grant. `retry`, `storage`,
  `leewaySeconds`, `fetch` and `config` tune the rest; `config` is merged last, so
  anything the factory chose can be overridden.

  The runtime helpers are re-exported from the package root, so a consumer who
  needs to reach into the stack — to register interceptors, to own the token
  source, or to put a transport underneath, as the Elastic Path MCP server does —
  still installs only `@epcc-sdk/sdks-pricebooks`. The README now leads with the
  one-call version and shows the manual composition after it.

  `@epcc-sdk/sdks-runtime` is a new runtime dependency. It depends on
  `@epcc-sdk/authentication`, which it uses to call the token endpoint, and that
  package has no dependencies of its own. Installing this package therefore adds
  two packages to a dependency tree.

### Patch Changes

- Updated dependencies [11cd5605]
  - @epcc-sdk/sdks-runtime@0.1.0

## 0.0.2

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.1

### Patch Changes

- ecc6c3e: Add files and price book sdks
