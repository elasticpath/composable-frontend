---
"@epcc-sdk/sdks-currencies": minor
---

Regenerate the currencies SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2), add
`createCurrenciesClient`, and publish the Zod schemas.

What is new:

- `createCurrenciesClient` binds the generated `createClient` and `createConfig` to
  `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
  token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
  backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
  replay cannot duplicate work.

  ```ts
  const client = createCurrenciesClient({
    baseUrl: "https://euwest.api.elasticpath.com",
    clientId: process.env.EPCC_CLIENT_ID!,
    clientSecret: process.env.EPCC_CLIENT_SECRET!,
  })
  ```

  Credentials are resolved from `source`, `provider`, `token`, `clientId` plus
  `clientSecret`, or `clientId` alone for the implicit grant. `retry`, `storage`,
  `leewaySeconds`, `fetch` and `config` tune the rest; `config` is merged last, so
  anything the factory chose can be overridden. The runtime helpers are re-exported from
  the package root, so a consumer who assembles the stack by hand still installs only
  this package.

- Zod schemas for every request body, path and response are generated and exposed on the
  `@epcc-sdk/sdks-currencies/zod` subpath. `zod` is an optional peer dependency (3.x) and
  the root entry never imports it.

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

All five operations keep their names — `getAllCurrencies`, `createACurrency`,
`getACurrency`, `updateACurrency` and `deleteACurrency` — and their `Data` / `Response` /
`Error` types. `ClientOptions`, the known base URL union, is new; nothing else in the
exported type surface is renamed or removed. This specification declares no `date-time`
or `int64` fields, so dropping the `@hey-api/transformers` plugin changes no type here; it
is left out to match the other packages on this generator, where it declared types the
runtime values contradicted.
