# @epcc-sdk/rule-promotions

## 0.2.0

### Minor Changes

- da9b30ac: Regenerate the rule promotions SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2), add
  `createRulePromotionsClient`, and publish the Zod schemas.

  The package now generates from a `rule-promotions-standalone@v1` bundle: the published
  specification, unchanged in this repository, plus three corrections in
  `specs/overrides/rule_promotions_service_corrections.yaml` where it disagrees with the
  service. Each is listed below.

  What is new:

  - `createRulePromotionsClient` binds the generated `createClient` and `createConfig` to
    `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
    token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
    backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
    replay cannot duplicate work.

    ```ts
    const client = createRulePromotionsClient({
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
    `@epcc-sdk/rule-promotions/zod` subpath. `zod` is an optional peer dependency (3.x) and
    the root entry never imports it. `zPageOffset`, `zPageLimit` and the query schema of
    `getRulePromotions` coerce `page[offset]` and `page[limit]`, which the specification
    declares `int64`, to `bigint`, as the zod plugin does for every `int64`; the TypeScript
    types keep them `number`.

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
  - The nine `date-time` fields are typed `string`, not `Date`: `start`, `end`,
    `meta.timestamps.created_at` and `meta.timestamps.updated_at` on
    `RulePromotionBaseAttributes` (and so on every rule promotion), `used_on` and
    `meta.timestamps.updated_at` on `RulePromotionUsage`, `meta.timestamps.created_at` on
    `GetPromotionCodeResponse`, and `meta.timestamps.created_at` and
    `meta.timestamps.updated_at` on `PromotionJobResponse`. The old `@hey-api/transformers`
    plugin declared them `Date`, but no operation called its transformer, so the value at
    runtime was always the string the API sends. Code that called a `Date` method on one of
    these fields stops compiling; wrap the value in `new Date(...)` where you need one.
  - `createRulePromotion` and `updateRulePromotion` take `{ data: RulePromotionItem }`
    (`RulePromotionRequest`, new), not the bare `RulePromotionItem`. The service reads both
    bodies as `data`, and every create and update example in the specification sends it, so
    the old body type could not describe a request the service accepts.
  - An action's `condition` is typed. The specification discriminates `Condition` on
    `strategy` without a mapping, which by OpenAPI's rules makes the values the schema names
    (`"AndCondition"`, ...) rather than the strategies the service reads (`"and"`, ...). The
    old types therefore accepted only a condition with no `strategy`; 0.99 typed `Condition`
    as `never`, and the `/zod` entry threw on import. `Condition` is now a union discriminated
    on `strategy`, and `AndCondition`, `OrCondition` and the other eight condition types require
    it. A condition without `strategy` stops compiling; the service rejects one anyway.
  - The inline enum types `ConsumeUnit`, `JobType`, `PriceStrategy`, `Operator`, `Status` and
    `Sort` are no longer exported, because the `exportInlineEnums` option does not exist in
    0.99. Their unions are unchanged and are now written inline at each use site. Replace a
    reference with the literal union, or derive it:
    `NonNullable<NonNullable<NonNullable<PromotionCodesRequest["data"]>["codes"]>[number]["consume_unit"]>`,
    `NonNullable<PromotionJob["job_type"]>`,
    `NonNullable<NonNullable<NonNullable<ItemDiscount["limitations"]>["items"]>["price_strategy"]>`,
    `NonNullable<ItemAttribute["operator"]>`, `NonNullable<PromotionJobResponse["status"]>` and
    `NonNullable<NonNullable<GetRulePromotionCodesData["query"]>["sort"]>`.
  - Two fields follow the specification's OpenAPI 3.1 type arrays, where the old generator kept
    one type:
    - An error's `status` in `ResponseError`, and so in every operation's `Error` type, is
      `string | number`, not `number`. Code that assigns it straight to a `number` must narrow
      it first.
    - The value in the `args` of `CartCustomAttributes`, `CartItemCustomAttributes`,
      `CartItemCustomAttributeCondition`, `ItemAttribute` and `ItemAttributeCondition` is
      `string | boolean | number`, not `number`, so a string or boolean attribute value now
      compiles. Code that reads it as a `number` must narrow it first.

  What is fixed:

  - `PageOffset`, `PageLimit` and the `page[offset]` and `page[limit]` query parameters of
    `getRulePromotions` are typed `number`, not `BigInt`. The `@hey-api/transformers` plugin
    declared `BigInt` for these `int64` fields while nothing converted the values, so the
    declared type was wrong. A caller that passed a `bigint` such as `10n` must pass a
    `number`.
  - The `Authorization` header parameter is optional. The specification declares it required
    on 11 operations, on top of its bearer security scheme, so the old types made those calls
    pass `headers: { Authorization }`. Leave it out: a client from
    `createRulePromotionsClient` sends a header it is given as it is, with no token of its own
    and no replay after a 401.

  All 16 operations keep their names — `getRulePromotions`, `createRulePromotion`,
  `deleteRulePromotion`, `getRulePromotionById`, `updateRulePromotion`,
  `deleteRulePromotionCodes`, `getRulePromotionCodes`, `createRulePromotionCodes`,
  `deleteSingleRulePromotionCode`, `getRulePromotionJobs`, `createRulePromotionJob`,
  `getRulePromotionJobFile`, `cancelRulePromotionJob`, `anonymizeRulePromotionUsages`,
  `getRulePromotionUsages` and `getRulePromotionCodeUsages` — and their `Data` / `Response` /
  `Error` types. `ClientOptions`, the known base URL union, is new; apart from the changes
  listed above, nothing in the exported type surface is renamed or removed.

## 0.1.0

### Minor Changes

- b195c7b5: Regenerate from the upstream `rule-promotions` spec (spec version 26.0504.7552059, published 2026-05-04T17:39:21Z).

  Adds 79 exported symbols.

  **Breaking.** Removes 25 exported symbols:

  - `rule-promotions: Type`
  - `rule-promotions: RulePromotionRequest`
  - `rule-promotions: PromotionJobCreatedResponse`
  - `rule-promotions: PromotionJobCanceledResponse`
  - `rule-promotions: ResponsePaginationMeta`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsData`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsResponses`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsResponse`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsData`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsErrors`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsError`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsResponses`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsResponse`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsByJobUuidFileData`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsByJobUuidFileResponses`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsByJobUuidFileResponse`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsByJobUuidCancelData`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsByJobUuidCancelErrors`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsByJobUuidCancelError`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsByJobUuidCancelResponses`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsByJobUuidCancelResponse`
  - `rule-promotions: getV2RulePromotionsByUuidJobs`
  - `rule-promotions: postV2RulePromotionsByUuidJobs`
  - `rule-promotions: getV2RulePromotionsByUuidJobsByJobUuidFile`
  - `rule-promotions: postV2RulePromotionsByUuidJobsByJobUuidCancel`

## 0.0.3

### Patch Changes

- 38ea71fc: add max unit in rule promotion limitation

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
