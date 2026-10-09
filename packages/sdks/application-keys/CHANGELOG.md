# @epcc-sdk/sdks-application-keys

## 0.3.0

### Minor Changes

- b1c89251: The `/zod` schemas parse `int64` values as `number`, the type the TypeScript types already use, instead of `bigint`. A value validated with the schema can now be passed straight to the operation or field that takes it.

  - `z.coerce.bigint()` becomes `z.number().int()` behind a step that turns a string into a number, so a query string value such as `"20"` still parses, to `20`.
  - The bounds the specification declares stay, as plain numbers. The 64-bit range of the format itself is no longer emitted, because a `number` cannot hold it.
  - No `BigInt(…)` is left in the generated schemas.

  The TypeScript types, the SDK functions and the exported names do not change.

  Breaking in practice, although the version is a minor:

  - `.parse()` returns a `number` where it returned a `bigint` for `zPageOffset`, `zPageLimit` and `zListApplicationKeysQuery`. Code that compared the result with a `bigint` literal such as `20n`, or did `bigint` arithmetic on it, needs to use numbers.
  - Only strings are converted. A boolean is rejected, where `z.coerce.bigint()` turned `true` into `1n` and `false` into `0n`. `null` on a required field is still rejected.
  - `z.input` of the affected schemas is now `unknown`, because `z.preprocess` in Zod v3 types its input that way.

## 0.2.0

### Minor Changes

- f590bd23: Regenerate the application keys SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2),
  add `createApplicationKeysClient`, and publish the Zod schemas.

  What is new:

  - `createApplicationKeysClient` binds the generated `createClient` and `createConfig` to
    `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
    token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
    backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
    replay cannot duplicate work.

    ```ts
    const client = createApplicationKeysClient({
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
    `@epcc-sdk/sdks-application-keys/zod` subpath. `zod` is an optional peer dependency
    (3.x) and the root entry never imports it. The query schemas coerce `page[offset]` and
    `page[limit]`, which the specification declares `int64`, to `bigint`, as the zod plugin
    does for every `int64`; the TypeScript types keep them `number`.

  Breaking in practice, although the version is a minor:

  - The `@hey-api/client-fetch` dependency is gone. The fetch client is vendored into
    `src/client/{client,core}`, and the root entry exports `createClient`, `createConfig`,
    the shared `client` instance and the `Client`, `Config`, `CreateClientConfig`,
    `RequestOptions` and `RequestResult` types. Import those from this package instead of
    from `@hey-api/client-fetch`, which is deprecated.
  - The shared `client` instance now carries a default base URL of
    `https://euwest.api.elasticpath.com`; before, it had none. The specification lists US
    East first, so the region is chosen in the generator config instead; every other package
    on this generator already defaults to EU West, and a consumer installing two of them and
    configuring neither would otherwise talk to two regions with no warning and no type
    error.

  What is fixed:

  - `PageOffset`, `PageLimit` and the `page[offset]` and `page[limit]` query parameters of
    `listApplicationKeys` are typed `number`, not `BigInt`. The `@hey-api/transformers`
    plugin declared `BigInt` for these `int64` fields while nothing converted the values, so
    the declared type was wrong. A caller that passed a `bigint` such as `10n` must pass a
    `number`.

  All five operations keep their names — `listApplicationKeys`, `createAnApplicationKey`,
  `getAnApplicationKey`, `updateAnApplicationKey` and `deleteAnApplicationKey` — and their
  `Data` / `Response` / `Error` types. `ClientOptions`, the known base URL union, is new;
  nothing else in the exported type surface is renamed or removed. This specification
  declares no `date-time` fields, so dropping the `@hey-api/transformers` plugin changes no
  timestamp type here.

## 0.1.0

### Minor Changes

- 619e3b2e: Regenerate from the upstream `application-keys` spec (spec version 26.0212.7188016, published 2026-02-12T23:38:57Z).

  Adds 35 exported symbols.

  **Breaking.** Removes 35 exported symbols:

  - `application-keys: ApplicationKeyResponse`
  - `application-keys: ErrorResponse`
  - `application-keys: _Error`
  - `application-keys: PaginationMeta`
  - `application-keys: SelfLink`
  - `application-keys: GetAllKeysData`
  - `application-keys: GetAllKeysErrors`
  - `application-keys: GetAllKeysError`
  - `application-keys: GetAllKeysResponses`
  - `application-keys: GetAllKeysResponse`
  - `application-keys: CreateKeyData`
  - `application-keys: CreateKeyErrors`
  - `application-keys: CreateKeyError`
  - `application-keys: CreateKeyResponses`
  - `application-keys: CreateKeyResponse`
  - `application-keys: DeleteKeyData`
  - `application-keys: DeleteKeyErrors`
  - `application-keys: DeleteKeyError`
  - `application-keys: DeleteKeyResponses`
  - `application-keys: DeleteKeyResponse`
  - `application-keys: GetKeyData`
  - `application-keys: GetKeyErrors`
  - `application-keys: GetKeyError`
  - `application-keys: GetKeyResponses`
  - `application-keys: GetKeyResponse`
  - `application-keys: UpdateKeyData`
  - `application-keys: UpdateKeyErrors`
  - `application-keys: UpdateKeyError`
  - `application-keys: UpdateKeyResponses`
  - `application-keys: UpdateKeyResponse`
  - `application-keys: getAllKeys`
  - `application-keys: createKey`
  - `application-keys: deleteKey`
  - `application-keys: getKey`
  - `application-keys: updateKey`

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
