# @epcc-sdk/integrations

## 0.2.0

### Minor Changes

- da9b30ac: Regenerate the integrations SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2), add
  `createIntegrationsClient`, and publish the Zod schemas.

  What is new:

  - `createIntegrationsClient` binds the generated `createClient` and `createConfig` to
    `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
    token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
    backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
    replay cannot duplicate work.

    ```ts
    const client = createIntegrationsClient({
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
    `@epcc-sdk/integrations/zod` subpath. `zod` is an optional peer dependency (3.x) and the
    root entry never imports it.

  Breaking in practice, although the version is a minor:

  - The `@hey-api/client-fetch` dependency is gone. The fetch client is vendored into
    `src/client/{client,core}`, and the root entry exports `createClient`, `createConfig`,
    the shared `client` instance and the `Client`, `Config`, `CreateClientConfig`,
    `RequestOptions` and `RequestResult` types. Import those from this package instead of
    from `@hey-api/client-fetch`, which is deprecated.
  - The shared `client` instance now carries a default base URL of
    `https://euwest.api.elasticpath.com/v2`; before, it had none. The specification already
    lists EU West first, puts `/v2` in its server URLs and starts its paths at
    `/integrations`, so the default carries the `/v2`; the region is set in the generator
    config as well, so a refresh that reorders the servers cannot change it.
    `createIntegrationsClient` takes the host, as every other factory does: it fetches tokens
    from `baseUrl` and sends operations to `baseUrl` plus `/v2`, and it accepts a `baseUrl`
    that already ends in `/v2`. A client built with `createClient` needs the `/v2` in its
    `baseUrl`.
  - The three `date-time` fields are typed `string`, not `Date`: `created_at` and
    `updated_at` on `Timestamps` (the `meta.timestamps` of every integration), and
    `IntegrationLog`'s `meta.timestamps.created_at`. The old `@hey-api/transformers` plugin
    declared them `Date`, but no operation called its transformer, so the value at runtime
    was always the string the API sends. Code that called a `Date` method on one of these
    fields stops compiling; wrap the value in `new Date(...)` where you need one.
  - The inline enum types `Type` and `IntegrationType` are no longer exported, because the
    `exportInlineEnums` option does not exist in 0.99. Their unions are unchanged and are
    now written inline at each use site. Replace a reference with the literal union, or
    derive it: `IntegrationCreate["type"]` and `IntegrationCreate["integration_type"]`.

  All nine operations keep their names — `listIntegrations`, `createIntegration`,
  `deleteIntegration`, `getIntegration`, `updateIntegration`, `listStoreLogs`,
  `listIntegrationLogs`, `listIntegrationJobs` and `listJobLogs` — and their `Data` /
  `Response` / `Error` types. `ClientOptions`, the known base URL union, is new; apart from the
  changes listed above, nothing in the exported type surface is renamed or removed.

## 0.1.0

### Minor Changes

- 0371d39f: Regenerate from the upstream `integrations` spec (spec version 26.0709.7872701, published 2026-07-09T09:54:51Z).

  Adds 3 exported symbols.

  **Breaking.** Removes 1 exported symbol:

  - `integrations: PaginationMeta`

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
