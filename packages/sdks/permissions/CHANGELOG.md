# @epcc-sdk/permissions

## 0.4.0

### Minor Changes

- b1c89251: The `/zod` schemas parse `int64` values as `number`, the type the TypeScript types already use, instead of `bigint`. A value validated with the schema can now be passed straight to the operation or field that takes it.

  - `z.coerce.bigint()` becomes `z.number().int()` behind a step that turns a string into a number, so a query string value such as `"20"` still parses, to `20`.
  - The bounds the specification declares stay, as plain numbers. The 64-bit range of the format itself is no longer emitted, because a `number` cannot hold it.
  - No `BigInt(…)` is left in the generated schemas.

  The TypeScript types, the SDK functions and the exported names do not change.

  Breaking in practice, although the version is a minor:

  - `.parse()` returns a `number` where it returned a `bigint` for `zPageOffset`, `zPageLimit` and `zListCustomApiRolePoliciesQuery`. Code that compared the result with a `bigint` literal such as `20n`, or did `bigint` arithmetic on it, needs to use numbers.
  - Only strings are converted. A boolean is rejected, where `z.coerce.bigint()` turned `true` into `1n` and `false` into `0n`. `null` on a required field is still rejected.
  - `z.input` of the affected schemas is now `unknown`, because `z.preprocess` in Zod v3 types its input that way.

## 0.3.0

### Minor Changes

- bf33a2e8: Regenerate from the upstream `permissions` spec (spec version 26.0827.8090714, published 2026-08-27T05:25:45Z).

  Adds 1 exported symbol.

## 0.2.0

### Minor Changes

- f590bd23: Regenerate the permissions SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2), add
  `createPermissionsClient`, and publish the Zod schemas.

  What is new:

  - `createPermissionsClient` binds the generated `createClient` and `createConfig` to
    `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
    token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
    backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
    replay cannot duplicate work.

    ```ts
    const client = createPermissionsClient({
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
    `@epcc-sdk/permissions/zod` subpath. `zod` is an optional peer dependency (3.x) and the
    root entry never imports it. The query schemas coerce `page[offset]` and `page[limit]`,
    which the specification declares `int64`, to `bigint`, as the zod plugin does for every
    `int64`; the TypeScript types keep them `number`.

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
  - The inline enum types `Accounts`, `ApplicationKeys`, `Authentication`,
    `CatalogReleases`, `Catalogs`, `Composer`, `Currencies`, `CustomApis`, `Flows`,
    `LegacyCatalogs`, `Metrics`, `Orders`, `PaymentGateways`, `PersonalData`, `PriceBooks`,
    `Products`, `Promotions`, `Settings`, `Sort`, `SubscriptionBilling`, `SubscriptionJobs`,
    `SubscriptionOfferings`, `SubscriptionSubscribers`, `Team`, `Type` and `Webhooks` are no
    longer exported, because the `exportInlineEnums` option does not exist in 0.99. Their
    unions are unchanged and are now written inline at each use site. Replace a reference
    with the literal union, or derive it, for example
    `NonNullable<StandardUserRole["access_levels"]>["accounts"]`.

  What is fixed:

  - `PageOffset`, `PageLimit` and the `page[offset]` and `page[limit]` query parameters of
    `listCustomApiRolePolicies` are typed `number`, not `BigInt`. The
    `@hey-api/transformers` plugin declared `BigInt` for these `int64` fields while nothing
    converted the values, so the declared type was wrong. A caller that passed a `bigint`
    such as `10n` must pass a `number`.

  All nine operations keep their names — `listStandardUserRoles`, `getAStandardUserRole`,
  `listStandardShopperRoles`, `getAStandardShopperRole`, `createACustomApiRolePolicy`,
  `listCustomApiRolePolicies`, `getACustomApiRolePolicy`, `updateACustomApiRolePolicy` and
  `deleteACustomApiRolePolicy` — and their `Data` / `Response` / `Error` types.
  `ClientOptions`, the known base URL union, is new; apart from the changes listed above,
  nothing in the exported type surface is renamed or removed. This specification declares no
  `date-time` fields, so dropping the `@hey-api/transformers` plugin changes no timestamp
  type here.

## 0.1.0

### Minor Changes

- d2ca6541: Regenerate from the upstream `permissions` spec (spec version 26.0610.7728570, published 2026-06-10T00:02:14Z).

  Adds 58 exported symbols.

  **Breaking.** Removes 19 exported symbols:

  - `permissions: BuiltInRoleAttributes`
  - `permissions: BuiltInRoleSelfLink`
  - `permissions: CustomApiRolePolicyAttributes`
  - `permissions: CustomApiRolePolicySelfLink`
  - `permissions: ErrorResponse`
  - `permissions: _Error`
  - `permissions: BuiltInRoleId`
  - `permissions: ListBuiltInRolesData`
  - `permissions: ListBuiltInRolesErrors`
  - `permissions: ListBuiltInRolesError`
  - `permissions: ListBuiltInRolesResponses`
  - `permissions: ListBuiltInRolesResponse`
  - `permissions: GetABuiltInRoleData`
  - `permissions: GetABuiltInRoleErrors`
  - `permissions: GetABuiltInRoleError`
  - `permissions: GetABuiltInRoleResponses`
  - `permissions: GetABuiltInRoleResponse`
  - `permissions: listBuiltInRoles`
  - `permissions: getABuiltInRole`

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
