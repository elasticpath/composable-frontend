# @epcc-sdk/sdks-files

## 0.2.0

### Minor Changes

- b1c89251: The `/zod` schemas parse `int64` values as `number`, the type the TypeScript types already use, instead of `bigint`. A value validated with the schema can now be passed straight to the operation or field that takes it.

  - `z.coerce.bigint()` becomes `z.number().int()` behind a step that turns a string into a number, so a query string value such as `"20"` still parses, to `20`.
  - The bounds the specification declares stay, as plain numbers.
  - No `BigInt(…)` is left in the generated schemas.

  The TypeScript types, the SDK functions and the exported names do not change.

  Breaking in practice, although the version is a minor:

  - `.parse()` returns a `number` where it returned a `bigint` for `zPageOffset`, `zPageLimit` and `zGetAllFilesQuery`. Code that compared the result with a `bigint` literal such as `20n`, or did `bigint` arithmetic on it, needs to use numbers.
  - Only strings are converted. A boolean is rejected, where `z.coerce.bigint()` turned `true` into `1n` and `false` into `0n`. `null` on a required field is still rejected.
  - `z.input` of the affected schemas is now `unknown`, because `z.preprocess` in Zod v3 types its input that way.

## 0.1.0

### Minor Changes

- f590bd23: Regenerate the files SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2), add
  `createFilesClient`, and publish the Zod schemas.

  What is new:

  - `createFilesClient` binds the generated `createClient` and `createConfig` to
    `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
    token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
    backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
    replay cannot duplicate work.

    ```ts
    const client = createFilesClient({
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
    `@epcc-sdk/sdks-files/zod` subpath. `zod` is an optional peer dependency (3.x) and the
    root entry never imports it. The query schemas coerce `page[offset]` and `page[limit]`,
    which the specification declares `int64`, to `bigint`, as the zod plugin does for every
    `int64`; the TypeScript types keep them `string`.

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

  All four operations keep their names — `getAllFiles`, `createAFile`, `getAFile` and
  `deleteAFile` — and their `Data` / `Response` / `Error` types. `ClientOptions`, the known
  base URL union, is new; apart from the changes listed above, nothing in the exported type
  surface is renamed or removed. The old types declared no `Date` and no `BigInt`, so
  dropping the `@hey-api/transformers` plugin changes no type here; it is left out to match
  the other packages on this generator, where it declared types the runtime values
  contradicted.

## 0.0.3

### Patch Changes

- 9b7373e2: Regenerate from the upstream `files` spec (spec version 26.0708.7869251, published 2026-07-08T10:28:23Z).

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
