---
"@epcc-sdk/sdks-pricebooks": minor
---

Add `createPricebooksClient`, a bound convenience factory over
`@epcc-sdk/sdks-runtime`. Install one package, call one function, and get a
client with a caching token source, the `auth` hook and a `fetch` that refreshes
and replays once on a 401 and backs off on a 429, a 408, and on a 5xx or a
transport failure where a replay cannot duplicate work.

```ts
const client = createPricebooksClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
})
```

Credentials are resolved from `source`, `provider`, `token`, `clientId` plus
`clientSecret`, or `clientId` alone for the implicit grant. `retry`, `storage`,
`leewaySeconds`, `fetch` and `config` tune the rest; `config` is merged last, so
anything the factory chose can be overridden.

The runtime helpers are re-exported from the package root, so a consumer who
needs to reach into the stack — to register interceptors, to own the token
source, or to put a transport underneath, as the Elastic Path MCP server does —
still installs only `@epcc-sdk/sdks-pricebooks`. The README now leads with the
one-call version and shows the manual composition after it.

`@epcc-sdk/sdks-runtime` is a new runtime dependency. It depends on
`@epcc-sdk/authentication`, which it uses to call the token endpoint, and that
package has no dependencies of its own. Installing this package therefore adds
two packages to a dependency tree.
