# @epcc-sdk/sdks-catalogs

A TypeScript client for the Elastic Path admin catalogs API. It is generated from the API
specification, so the request and response types match the API.

This is the authoring side of catalogs: create and update catalogs and catalog rules, publish
releases, and read the hierarchies, nodes and products inside a release. It covers the 30
operations under `/catalogs`. It is not the shopper catalog: the `/catalog/*` browsing
operations a storefront calls live in `@epcc-sdk/sdks-shopper`.

## Installation

```bash
npm install @epcc-sdk/sdks-catalogs
# or
pnpm install @epcc-sdk/sdks-catalogs
# or
yarn add @epcc-sdk/sdks-catalogs
```

## Quick start

One package, one function, and an authenticated request:

```ts
import { createCatalogsClient, getCatalogs } from "@epcc-sdk/sdks-catalogs"

const client = createCatalogsClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
})

const { data } = await getCatalogs({ client })
```

That client does three things for you.

1. It gets an access token on the first call, keeps it, and gets a new one before it expires.
   Callers that ask at the same time share one request for a token.
2. It puts the token on every request.
3. It sends a request again when that is safe. A 401 response causes one new token and one
   repeat. A 408, a 429, and some server and connection failures cause a wait and a repeat.

The waiting schedule allows three attempts. The first wait is 500 milliseconds and each wait is
longer than the last, up to 20 seconds, with a random offset. The client reads the `Retry-After`
response header when the server sends one. It stops after 30 seconds.

### Credentials

| Pass | Grant type |
| --- | --- |
| `clientId` and `clientSecret` | Client credentials. This carries a secret, so use it on a server only |
| `clientId` alone | Implicit. This is safe in a browser |
| `token` | A token that you obtained yourself. It cannot be replaced, so a 401 response is final |
| `provider` | Your own `TokenProvider` function |
| `source` | A `TokenSource` that you already hold, when you need to clear the token at sign-out |

These operations change catalog data, so most callers want the client credentials grant on a
server.

### Other options

| Option | What it does |
| --- | --- |
| `storage` | Where the token lives. The default is `memoryStorage`. Use `localStorageAdapter` to keep the token across a page reload and across tabs |
| `leewaySeconds` | How long before expiry to get a new token |
| `retry` | Any option of `createRetryFetch`. Set it to `false` to keep authentication and remove the waiting schedule |
| `fetch` | The transport under both wrappers, including the call to the token endpoint |
| `config` | Applied last, so it overrides any choice the factory made |

```ts
const client = createCatalogsClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
  retry: { maxAttempts: 5, deadlineMs: 60_000 },
  config: { throwOnError: true },
})
```

## Base URL

Set `baseUrl` to the region you use. The package ships
`https://euwest.api.elasticpath.com` as the default, taken from the server list in the API
specification. A consumer who routes requests through a same-origin proxy must set `baseUrl` to
that proxy.

Give it the host only, with no path. The operations carry their own paths.

## Pass the client to every operation

The generated code exports a module level `client` that holds no credentials. An operation
called without `{ client }` uses that one instead. The request then carries no token, and the
API answers with a 401 status. Pass your own client to every operation.

```ts
const { data } = await getCatalogs({ client })
```

## Releases

Read operations take a `release_id`. Pass `latestPublished` for the current release rather than
looking an id up first.

```ts
import { getAllProducts } from "@epcc-sdk/sdks-catalogs"

const { data } = await getAllProducts({
  client,
  path: { catalog_id: catalogId, release_id: "latestPublished" },
})
```

## Build the client yourself

Do this when you must get inside the stack: to add your own code before a request, to own the
token source, or to put your own transport underneath. This package re-exports every part, so
there is still one install.

```ts
import {
  clientCredentialsProvider,
  createAuthCallback,
  createAuthenticatedFetch,
  createClient,
  createConfig,
  createRetryFetch,
  createTokenSource,
} from "@epcc-sdk/sdks-catalogs"

const baseUrl = "https://euwest.api.elasticpath.com"

const source = createTokenSource(
  clientCredentialsProvider({
    baseUrl,
    clientId: process.env.EPCC_CLIENT_ID!,
    clientSecret: process.env.EPCC_CLIENT_SECRET!,
  }),
  { leewaySeconds: 300 },
)

const client = createClient(
  createConfig({
    baseUrl,
    auth: createAuthCallback(source),
    fetch: createRetryFetch({ fetch: createAuthenticatedFetch(source) }),
  }),
)
```

Two parts of that `fetch` line matter.

1. Build both adapters from one `source`. `createAuthenticatedFetch` decides whether an
   `Authorization` header is its own by comparing it with the cached token of that source. Two
   sources each treat the other's token as a credential that they must not change.
2. Put the authentication wrapper inside the retry wrapper. Both have the same shape and both
   accept a `fetch`, so the other order also compiles. In that order the number of requests
   multiplies, and the retry layer spends every attempt sending a request with a dead token.

## Zod schemas

Runtime schemas for every request and response body are published on a subpath, so the main
entry never imports zod. `zod` is an optional peer dependency.

```ts
import { zCatalogCreateData } from "@epcc-sdk/sdks-catalogs/zod"
```
