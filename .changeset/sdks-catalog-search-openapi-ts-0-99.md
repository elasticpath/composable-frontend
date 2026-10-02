---
"@epcc-sdk/sdks-catalog-search": minor
---

Regenerate the catalog search SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2), add
`createCatalogSearchClient`, and publish the Zod schemas.

The package still generates from the `catalog_search-standalone@v1` bundle. The specification
is unchanged in this repository; the bundle now applies two preprocessors to it, both listed
below.

What is new:

- `createCatalogSearchClient` binds the generated `createClient` and `createConfig` to
  `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
  token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
  backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
  replay cannot duplicate work.

  ```ts
  const client = createCatalogSearchClient({
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

- Zod schemas for every request body, path, query and response are generated and exposed on
  the `@epcc-sdk/sdks-catalog-search/zod` subpath. `zod` is an optional peer dependency (3.x)
  and the root entry never imports it. `zTextMatchInfo` coerces `num_tokens_dropped`, which
  the specification declares `int64`, to `bigint`, as the zod plugin does for every `int64`;
  the TypeScript types keep it `number`.

Breaking in practice, although the version is a minor:

- The `@hey-api/client-fetch` dependency is gone. The fetch client is vendored into
  `src/client/{client,core}`, and the root entry exports `createClient`, `createConfig`,
  the shared `client` instance and the `Client`, `Config`, `CreateClientConfig`,
  `RequestOptions` and `RequestResult` types. Import those from this package instead of
  from `@hey-api/client-fetch`, which is deprecated.
- The shared `client` instance now carries a default base URL of
  `https://euwest.api.elasticpath.com`; before, it had none. The specification already lists
  EU West first; the region is set in the generator config as well, so a refresh that
  reorders the servers cannot change it.
- The base URL is the host, with no `/v2`. The specification's server URLs end in `/v2`, but
  the service answers at `<host>/pcm/...` and returns 404 at `<host>/v2/pcm/...`, so the
  bundle drops the `/v2` and `ClientOptions` lists `https://euwest.api.elasticpath.com` and
  `https://useast.api.elasticpath.com`. A client configured with a `/v2` base URL gets a 404
  on every operation; pass the host.
- The ten `date-time` fields are typed `string`, not `Date`: `created_at` and `updated_at` on
  `SearchRuleGroupMeta` and `SearchRuleMeta`, and `created_at`, `updated_at` and
  `last_synced_at` on `StopwordSetMeta` and `SynonymSetMeta`. They reach the responses of the
  create, list, get and update operations for stopword sets, synonym sets, rule groups and
  rules, and of `moveSearchRule`. The old `@hey-api/transformers` plugin declared them `Date`,
  but no operation called its transformer, so the value at runtime was always the string the
  API sends. Code that called a `Date` method on one of these fields stops compiling; wrap the
  value in `new Date(...)` where you need one. No request body carries a `date-time`.
- The inline enum types `Match`, `Placement`, `SplitJoinTokens`, `Status`, `SyncStatus` and
  `Type` are no longer exported, because the `exportInlineEnums` option does not exist in
  0.99. Their unions are unchanged and are now written inline at each use site. Replace a
  reference with the literal union, or derive it:
  `NonNullable<SearchRuleTrigger["match"]>`,
  `MoveSearchRuleRequest["data"]["attributes"]["placement"]`,
  `NonNullable<NonNullable<TypoTolerance>["split_join_tokens"]>`,
  `CatalogSearchJobAttributes["status"]`, `StopwordSetMeta["sync_status"]` and
  `SearchRuleType` (the old `Type`, `"catalog_search_rule"`).

What is fixed:

- `num_tokens_dropped` on `TextMatchInfo`, and so on every search hit's `text_match_info` in
  `postMultiSearch`, `multiSearchByCatalogRelease`, `searchByContext` and
  `searchByCatalogRelease`, is typed `number`, not `BigInt`. The `@hey-api/transformers`
  plugin declared `BigInt` for this `int64` field while nothing converted the value, so the
  declared type was wrong: the value at runtime was always a number.
- The specification gives a job's `type` a default of `index`, which is not one of its job
  types. Generated as declared, the `/zod` declarations did not compile, so the package could
  not build its `/zod` types, and a job without a `type` was reported as carrying `index`. The
  bundle now removes any `default` that is not one of its schema's `enum` values, so the
  schema behind `reindexTenantReleases`' response reports a missing `type` as missing. The
  service always sends `type`, and the TypeScript types are unchanged.

All 40 operations keep their names — `postMultiSearch`, `multiSearchByCatalogRelease`,
`searchByContext`, `searchByCatalogRelease`, `reindexTenantReleases`, `listIndexableFields`,
`createIndexableFields`, `deleteIndexableFields`, `getIndexableFields`,
`updateIndexableFields`, `listSearchableFields`, `listIndexedFields`, `listSearchProfiles`,
`createSearchProfile`, `deleteSearchProfile`, `getSearchProfile`, `updateSearchProfile`,
`setDefaultSearchProfile`, `listStopwordSets`, `createStopwordSet`, `deleteStopwordSet`,
`getStopwordSet`, `updateStopwordSet`, `listSynonymSets`, `createSynonymSet`,
`deleteSynonymSet`, `getSynonymSet`, `updateSynonymSet`, `listSearchRuleGroups`,
`createSearchRuleGroup`, `deleteSearchRuleGroup`, `getSearchRuleGroup`,
`updateSearchRuleGroup`, `listSearchRules`, `createSearchRule`, `deleteSearchRule`,
`getSearchRule`, `updateSearchRule`, `moveSearchRule` and `listSearchIndexes` — and their
`Data` / `Response` / `Error` types. `ClientOptions`, the known base URL union, is new; apart
from the changes listed above, nothing in the exported type surface is renamed or removed.
