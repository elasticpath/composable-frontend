---
"@epcc-sdk/sdks-accounts": minor
---

Regenerate the accounts SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2)
and add `createAccountsClient`.

What is new:

- `createAccountsClient` binds the generated `createClient` and `createConfig` to
  `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a
  caching token source, the `auth` hook and a `fetch` that refreshes and replays
  once on a 401 and backs off on a 429, a 408, and on a 5xx or a transport
  failure where a replay cannot duplicate work.

  ```ts
  const client = createAccountsClient({
    baseUrl: "https://euwest.api.elasticpath.com",
    clientId: process.env.EPCC_CLIENT_ID!,
    clientSecret: process.env.EPCC_CLIENT_SECRET!,
  })
  ```

  Credentials are resolved from `source`, `provider`, `token`, `clientId` plus
  `clientSecret`, or `clientId` alone for the implicit grant. `retry`, `storage`,
  `leewaySeconds`, `fetch` and `config` tune the rest; `config` is merged last,
  so anything the factory chose can be overridden. The runtime helpers are
  re-exported from the package root, so a consumer who assembles the stack by
  hand still installs only this package.

- `@epcc-sdk/sdks-runtime` is a new runtime dependency. It depends on
  `@epcc-sdk/authentication`, which has no dependencies of its own, so installing
  this package adds two packages to a dependency tree.

What breaks:

- The fetch client is now vendored into the package (`client/`, `core/`), so
  `@hey-api/client-fetch` is no longer a runtime dependency. `createClient`,
  `createConfig`, the shared `client` instance and the `Client`, `Config`,
  `CreateClientConfig`, `RequestOptions` and `RequestResult` types come from the
  package root instead. Import them from `@epcc-sdk/sdks-accounts`, not from
  `@hey-api/client-fetch`. `Client` is now a concrete type with no type
  parameters, so a consumer who wrote `Client<...>` with explicit type arguments
  must drop them.

- The shared `client` instance now carries a default base URL,
  `https://euwest.api.elasticpath.com`, the first entry in the specification's
  server list. It previously had none, so a request went to a relative URL and a
  same-origin proxy could pick it up. A consumer who does not want that default
  must pass `baseUrl` explicitly, through `createAccountsClient`, `createClient`,
  `client.setConfig` or the `baseUrl` option on a single operation. EU West users
  in particular must now set it.

- `_Error` is renamed to `Error`. Rename the import; the shape is unchanged.

- The inline enum types `Type`, `Sort` and `AccountMemberSelfManagement` are no
  longer exported, because the `exportInlineEnums` option does not exist in 0.99.
  Their unions are unchanged and are now written inline at each use site. Replace
  a reference with the literal union, or derive it, for example
  `NonNullable<GetV2AccountsData["query"]>["sort"]`.

What is fixed:

- `expires` on the account member token is typed `string`, not `Date`, and
  `PageLimit` and `PageOffset` are typed `number`, not `BigInt`. The
  `@hey-api/transformers` plugin declared those types while nothing wired the
  transformers in, so the values at runtime were always a string and a number and
  the declared types were wrong. The plugin is no longer enabled, and the
  incorrect `transformers.gen.ts` it produced is gone.

Also in this release: `ClientOptions` (the base URL union) and
`AccountResponseWritable` are newly exported, and every one of the 28 operation
functions keeps its name and its `Data` / `Response` / `Error` types.

The generated operations also changed how they merge your options. Previously the generated
`url` and `security` values overrode anything you passed; now your values win. This only
matters if you were passing `url` or `security` in a call's options and relying on them being
ignored, which is unlikely to be deliberate.
