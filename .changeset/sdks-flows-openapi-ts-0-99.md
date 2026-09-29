---
"@epcc-sdk/flows": minor
---

Regenerate the flows SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2), add
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
