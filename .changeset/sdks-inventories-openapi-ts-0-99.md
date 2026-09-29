---
"@epcc-sdk/sdks-inventories": minor
---

Regenerate the inventories SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2), add
`createInventoriesClient`, and publish the Zod schemas.

What is new:

- `createInventoriesClient` binds the generated `createClient` and `createConfig` to
  `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
  token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
  backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
  replay cannot duplicate work.

  ```ts
  const client = createInventoriesClient({
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
  `@epcc-sdk/sdks-inventories/zod` subpath. `zod` is an optional peer dependency (3.x) and
  the root entry never imports it. The schemas coerce the eleven `int64` fields to
  `bigint`, as the zod plugin does for every `int64`, so a parsed value carries `bigint`
  where the TypeScript types say `number`.

Breaking in practice, although the version is a minor:

- The `@hey-api/client-fetch` dependency is gone. The fetch client is vendored into
  `src/client/{client,core}`, and the root entry exports `createClient`, `createConfig`,
  the shared `client` instance and the `Client`, `Config`, `CreateClientConfig`,
  `RequestOptions` and `RequestResult` types. Import those from this package instead of
  from `@hey-api/client-fetch`, which is deprecated.
- The shared `client` instance now carries a default base URL of
  `https://euwest.api.elasticpath.com/v2`; before, it had none. This specification puts
  `/v2` in its server URLs and starts its paths at `/inventories`, so the default carries
  the `/v2`. `createInventoriesClient` takes the host, as every other factory does: it
  fetches tokens from `baseUrl` and sends operations to `baseUrl` plus `/v2`, and it
  accepts a `baseUrl` that already ends in `/v2`. A client built with `createClient` needs
  the `/v2` in its `baseUrl`.
- `_Error` is renamed to `Error`. Rename the import; the shape is unchanged.
- The inline enum types `Type`, `Action`, `Status` and `Sort` are no longer exported,
  because the `exportInlineEnums` option does not exist in 0.99. Their unions are
  unchanged and are now written inline at each use site. Replace a reference with the
  literal union, or derive it, for example `TransactionResponseAttributes["action"]`.

What is fixed:

- The eleven `int64` fields (`available`, `allocated`, `total` and `quantity` across the
  stock and transaction types) are typed `number`, not `BigInt`. The old
  `transformers.gen.ts` converted them to `BigInt`, but no operation called it, so the
  values at runtime were always numbers and the declared types were wrong. A request body
  that followed the old type threw when sent, because the old client passed it straight to
  `JSON.stringify`, which cannot serialise a `bigint`. `transformers.gen.ts` is removed,
  and big-integer output stays off.

All 18 operations keep their names — `createStock`, `listStock`, `getStockForProducts`,
`getStock`, `updateStock`, `deleteStock`, `listTransactions`, `createTransaction`,
`getTransaction`, `listLocations`, `createLocation`, `getLocation`, `updateLocation`,
`deleteLocation`, `createImport`, `listImportJobs`, `getImport` and `getImportErrors` —
and their `Data` / `Response` / `Error` types. `ClientOptions`, the known base URL union,
and `ImportWritable` are new; apart from the changes listed above, nothing in the exported
type surface is renamed or removed. This specification declares no `date-time` fields, so
dropping the `@hey-api/transformers` plugin changes no timestamp type here.
