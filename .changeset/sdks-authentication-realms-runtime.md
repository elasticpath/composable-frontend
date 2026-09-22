---
"@epcc-sdk/sdks-authentication-realms": minor
---

Add `createAuthenticationRealmsClient`, a bound convenience factory over
`@epcc-sdk/sdks-runtime`. Install one package, call one function, and get a client with a
caching token source, the `auth` hook and a `fetch` that refreshes and replays once on a
401 and backs off on a 429, a 408, and on a 5xx or a transport failure where a replay
cannot duplicate work.

```ts
const client = createAuthenticationRealmsClient({
  baseUrl: "https://useast.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
})
```

Credentials are resolved from `source`, `provider`, `token`, `clientId` plus
`clientSecret`, or `clientId` alone for the implicit grant. `retry`, `storage`,
`leewaySeconds`, `fetch` and `config` tune the rest; `config` is merged last, so anything
the factory chose can be overridden.

The runtime helpers — `createTokenSource`, `createAuthenticatedFetch`, `createRetryFetch`,
`createConfiguredClient`, the token providers and the storage adapters — are re-exported
from the package root, so a consumer who assembles the stack by hand still installs only
`@epcc-sdk/sdks-authentication-realms`.

The README's Authentication section previously said helpers were still being worked on and
showed a request interceptor that set a static bearer token. An interceptor cannot see a
response, so it can never retry a 401. It now leads with the factory.

`@epcc-sdk/sdks-runtime` is a new runtime dependency. It depends on
`@epcc-sdk/authentication`, which it uses to call the token endpoint. Installing this
package therefore adds two packages to a dependency tree.
