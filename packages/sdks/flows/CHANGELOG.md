# @epcc-sdk/flows

## 0.2.0

### Minor Changes

- f590bd23: Regenerate the flows SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2), add
  `createFlowsClient`, and publish the Zod schemas.

  What is new:

  - `createFlowsClient` binds the generated `createClient` and `createConfig` to
    `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
    token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
    backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
    replay cannot duplicate work.

    ```ts
    const client = createFlowsClient({
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

  - Zod schemas for every request body, path and response are generated and exposed on the
    `@epcc-sdk/flows/zod` subpath. `zod` is an optional peer dependency (3.x) and the root
    entry never imports it.

  Breaking in practice, although the version is a minor:

  - The `@hey-api/client-fetch` dependency is gone. The fetch client is vendored into
    `src/client/{client,core}`, and the root entry exports `createClient`, `createConfig`,
    the shared `client` instance and the `Client`, `Config`, `CreateClientConfig`,
    `RequestOptions` and `RequestResult` types. Import those from this package instead of
    from `@hey-api/client-fetch`, which is deprecated.
  - The shared `client` instance now carries a default base URL of
    `https://euwest.api.elasticpath.com`; before, it had none. The specification already
    lists EU West first; the region is set in the generator config as well, so a refresh
    that reorders the servers cannot change it.
  - `_Error` is renamed to `Error`. Rename the import; the shape is unchanged.
  - The inline enum types `Owner` and `Type` are no longer exported, because the
    `exportInlineEnums` option does not exist in 0.99. Their unions are unchanged and are
    now written inline at each use site. Replace a reference with the literal union, or
    derive it, for example `NonNullable<Meta["owner"]>`.

  What is fixed:

  - `Field.default` is typed `boolean | number | string | null`, not `string | null`, and
    the `from` and `to` of a `between` rule in `FieldValidationRules.options` are typed
    `number | string`, not `string`. The specification declares both as OpenAPI 3.1 type
    arrays, and the old generator kept only `string`, so an integer field's numeric default
    and bounds, which the API returns as numbers, contradicted the type. Code that assigns
    `default`, `from` or `to` straight to a `string` must narrow it first.

  All 19 operations keep their names — `getAllFlows`, `createAFlow`, `getAFlow`,
  `updateAFlow`, `deleteAFlow`, `getAllFields`, `createAField`, `getAField`, `updateAField`,
  `deleteAField`, `getAllEntries`, `createAnEntry`, `getAnEntry`, `updateAnEntry`,
  `deleteAnEntry`, `createAnEntryRelationship`, `updateAnEntryRelationship`,
  `deleteAnEntryRelationship` and `getAllFieldsByFlow` — and their `Data` / `Response` /
  `Error` types. `ClientOptions`, the known base URL union, is new; apart from the changes
  listed above, nothing in the exported type surface is renamed or removed. The old types
  declared no `Date` and no `BigInt`, so dropping the `@hey-api/transformers` plugin changes
  no type here; it is left out to match the other packages on this generator, where it
  declared types the runtime values contradicted.

## 0.1.0

### Minor Changes

- a01a07e4: Regenerate from the upstream `flows` spec (spec version 26.0630.7838720, published 2026-06-30T08:57:57Z).

  Adds 4 exported symbols.

  **Breaking.** Removes 1 exported symbol:

  - `flows: FlowsLinks`

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

- e5fbcf1: Release missing sdks
