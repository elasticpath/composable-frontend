# @epcc-sdk/sdks-pricebooks SDK

Below you'll find instructions on how to install, set up, and use the client, along with a list of available operations.


## Features

- type-safe response data and errors
- response data validation and transformation
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology

---


## Installation

```bash
npm install @epcc-sdk/sdks-pricebooks
# or
pnpm install @epcc-sdk/sdks-pricebooks
# or
yarn add @epcc-sdk/sdks-pricebooks
```

---

## Quick start

One package, one function, an authenticated request with retries.

```ts
import { createPricebooksClient, getPricebooks } from "@epcc-sdk/sdks-pricebooks"

const client = createPricebooksClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
})

const { data } = await getPricebooks({ client })
```

That client already has:

- a **token source** that mints a token on first use, caches it, refreshes it
  before it expires and collapses concurrent callers onto one token request;
- the **`auth` hook**, so every operation carries a bearer token;
- a **`fetch`** that refreshes and replays once on a 401, and backs off on a 429,
  a 408, and on a 5xx or a transport failure where a replay cannot duplicate
  work — three attempts, exponential from 500 ms with full jitter, capped at
  20 s, honouring `Retry-After`, giving up after 30 s.

### Credentials

| Pass | Grant |
| --- | --- |
| `clientId` + `clientSecret` | client credentials. Carries a secret: server-side only |
| `clientId` alone | implicit. Safe in a browser |
| `token` | a token you minted yourself. Cannot be refreshed, so a 401 against it is final |
| `provider` | your own `TokenProvider` |
| `source` | a `TokenSource` you already hold, when you need `clear()` on sign-out |

### Other options

`storage` (`memoryStorage` by default, `localStorageAdapter` to survive a reload
and stay in step across tabs), `leewaySeconds`, `retry` (any
`createRetryingFetch` option, or `false` to drop the backoff schedule and keep
authentication), `fetch` (the transport underneath both wrappers, including the
token endpoint) and `config`, which is merged last so anything the factory chose
can be overridden:

```ts
const client = createPricebooksClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
  retry: { maxAttempts: 5, deadlineMs: 60_000 },
  config: { throwOnError: true },
})
```

---

## Manual composition

Reach for this when you need to get inside the stack — to register interceptors,
to own the token source, or to put your own transport underneath. The Elastic
Path MCP server does exactly that. Everything below is re-exported from this
package, so there is still only one install.

```ts
import {
  clientCredentialsProvider,
  createAuthCallback,
  createClient,
  createConfig,
  createRetryFetch,
  createRetryingFetch,
  createTokenSource,
} from "@epcc-sdk/sdks-pricebooks"

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
    fetch: createRetryingFetch({ fetch: createRetryFetch(source) }),
  }),
)

client.interceptors.request.use((request) => {
  request.headers.set("X-Request-Id", crypto.randomUUID())
  return request
})
```

Two things about that `fetch` line are load-bearing:

- **Both adapters come from one `source`.** `createRetryFetch` decides whether an
  `Authorization` header is its own to refresh by comparing it against that
  source's cached token, so two sources would each see the other's token as a
  credential it must not touch.
- **The auth wrapper goes inside the retry wrapper.** Both are `fetch`-shaped and
  both take a `fetch`, so the opposite nesting compiles — and it makes attempts
  multiply, and lets the retry layer spend its whole budget replaying a token
  that is already dead. `@epcc-sdk/sdks-runtime` has the measurements.

Interceptors still run once per real outcome. Both wrappers sit below the
interceptor chain, so a recovered 401 or a retried 429 never reaches a logging or
metrics interceptor as a failure the caller did not experience.

---

## Client Usage


Clients are responsible for sending the actual HTTP requests.

The Fetch client is built as a thin wrapper on top of Fetch API, extending its functionality. If you're already familiar with Fetch, configuring your client will feel like working directly with Fetch API.

You can configure the client in two ways:

- Configuring the internal `client` instance directly
- Using the `createClient` function

**When using the operation function to make requests, by default the global client will be used unless another is provided.**


### 1. Configure the internal `client` instance directly

This is the simpler approach. You can call the setConfig() method at the beginning of your application or anytime you need to update the client configuration. You can pass any Fetch API configuration option to setConfig(), and even your own Fetch implementation.

```ts
import { client } from "@epcc-sdk/sdks-pricebooks";

client.setConfig({
// set default base url for requests
baseUrl: 'https://euwest.api.elasticpath.com',

// set default headers for requests
headers: {
Authorization: 'Bearer YOUR_AUTH_TOKEN',
},
});
```

The disadvantage of this approach is that your code may call the client instance before it's configured for the first time. Depending on your use case, you might need to use the second approach.

### 2. Using the `createClient` function

This is useful when you want to use a different instance of the client for different parts of your application or when you want to use different configurations for different parts of your application.

```ts
import { createClient } from "@epcc-sdk/sdks-pricebooks";

// Create the client with your API base URL.
const client = createClient({
    // set default base url for requests
    baseUrl: "https://euwest.api.elasticpath.com",
    /**
    * Set default headers only for requests made by this client.
    */
    headers: {
        "Custom-Header": 'My Value',
    },
});
```

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/sdks-pricebooks>".

```ts
const response = await getPricebookById({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getPricebookById({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/sdks-pricebooks";

// Supports async functions
client.interceptors.request.use(async (request) => {
    // do something
    return request;
});

client.interceptors.request.eject((request) => {
    // do something
    return request;
});

```

and an example response interceptor

```ts
import { client } from "@epcc-sdk/sdks-pricebooks";

client.interceptors.response.use((response) => {
    // do something
    return response;
});

client.interceptors.response.eject((response) => {
    // do something
    return response;
});
```

> **_Tip:_** To eject, you must provide a reference to the function that was passed to use().

## Authentication

See **Quick start** above for the one-call version and **Manual composition** for
the assembled one. Both come from `@epcc-sdk/sdks-runtime`, re-exported here.

An interceptor is still the right answer for a token you obtained some other way
and manage yourself:

```ts
import { client } from "@epcc-sdk/sdks-pricebooks";

client.interceptors.request.use((request, options) => {
  request.headers.set('Authorization', 'Bearer MY_TOKEN');
  return request;
});
```

Note that an interceptor cannot see a response, so nothing there can retry a
401. That is what `createRetryFetch` is for.

## Build URL

If you need to access the compiled URL, you can use the buildUrl() method. It's loosely typed by default to accept almost any value; in practice, you will want to pass a type hint.

```ts
type FooData = {
  path: {
    fooId: number;
  };
  query?: {
    bar?: string;
  };
  url: '/foo/{fooId}';
};

const url = client.buildUrl<FooData>({
  path: {
    fooId: 1,
  },
  query: {
    bar: 'baz',
  },
  url: '/foo/{fooId}',
});
console.log(url); // prints '/foo/1?bar=baz'
```


---





## Operation Usage
The following examples demonstrate how to use the operation function to make requests.

```ts
import { getPricebookById } from "@epcc-sdk/sdks-pricebooks";

const product = await getPricebookById({
  // client: localClient, // optional if you have a client instance you want to use otherwise the global client will be used
  path: {
    ...
  },
  query: {
    ...
  },
});
```

---



## Available Operations



- **`getPricebooks`** (`GET /pcm/pricebooks`)

- **`createPricebook`** (`POST /pcm/pricebooks`)

- **`deletePricebookById`** (`DELETE /pcm/pricebooks/{pricebookID}`)

- **`getPricebookById`** (`GET /pcm/pricebooks/{pricebookID}`)

- **`updatePricebook`** (`PUT /pcm/pricebooks/{pricebookID}`)

- **`importPricebook`** (`POST /pcm/pricebooks/import`)

- **`replicatePricebook`** (`POST /pcm/pricebooks/{pricebookID}/replicate`)

- **`getProductPrices`** (`GET /pcm/pricebooks/{pricebookID}/prices`)

- **`createProductPrice`** (`POST /pcm/pricebooks/{pricebookID}/prices`)

- **`deleteProductPrice`** (`DELETE /pcm/pricebooks/{pricebookID}/prices/{priceID}`)

- **`getProductPriceById`** (`GET /pcm/pricebooks/{pricebookID}/prices/{priceID}`)

- **`updateProductPrice`** (`PUT /pcm/pricebooks/{pricebookID}/prices/{priceID}`)

- **`getPrices`** (`GET /pcm/pricebooks/prices`)

- **`getPriceModifiers`** (`GET /pcm/pricebooks/{pricebookID}/modifiers`)

- **`createPriceModifier`** (`POST /pcm/pricebooks/{pricebookID}/modifiers`)

- **`deletePriceModifier`** (`DELETE /pcm/pricebooks/{pricebookID}/modifiers/{modifierID}`)

- **`getPriceModifierById`** (`GET /pcm/pricebooks/{pricebookID}/modifiers/{modifierID}`)

- **`updatePriceModifier`** (`PUT /pcm/pricebooks/{pricebookID}/modifiers/{modifierID}`)




---