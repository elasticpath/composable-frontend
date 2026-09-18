# @epcc-sdk/sdks-pricebooks

A TypeScript client for the Elastic Path price books API. It is generated from the API specification, so the request and response types match the API.

## What you get

This package holds the generated operations and types for the price books API. It also holds the runtime helpers, so one install gives you a client that authenticates itself and sends a failed request again.

The types come from the API specification. Errors are typed. You can read the original request and response. You can change any part of a request before it is sent.

## Installation

```bash
npm install @epcc-sdk/sdks-pricebooks
# or
pnpm install @epcc-sdk/sdks-pricebooks
# or
yarn add @epcc-sdk/sdks-pricebooks
```

## Quick start

One package, one function, and an authenticated request:

```ts
import { createPricebooksClient, getPricebooks } from "@epcc-sdk/sdks-pricebooks"

const client = createPricebooksClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
})

const { data } = await getPricebooks({ client })
```

That client does three things for you.

1. It gets an access token on the first call, keeps it, and gets a new one before it expires. Callers that ask at the same time share one request for a token.
2. It puts the token on every request.
3. It sends a request again when that is safe. A 401 response causes one new token and one repeat. A 408, a 429, and some server and connection failures cause a wait and a repeat.

The waiting schedule allows three attempts. The first wait is 500 milliseconds and each wait is longer than the last, up to 20 seconds, with a random offset. The client reads the `Retry-After` response header when the server sends one. It stops after 30 seconds.

### Credentials

| Pass | Grant type |
| --- | --- |
| `clientId` and `clientSecret` | Client credentials. This carries a secret, so use it on a server only |
| `clientId` alone | Implicit. This is safe in a browser |
| `token` | A token that you obtained yourself. It cannot be replaced, so a 401 response is final |
| `provider` | Your own `TokenProvider` function |
| `source` | A `TokenSource` that you already hold, when you need to clear the token at sign-out |

### Other options

| Option | What it does |
| --- | --- |
| `storage` | Where the token lives. The default is `memoryStorage`. Use `localStorageAdapter` to keep the token across a page reload and across tabs |
| `leewaySeconds` | How long before expiry to get a new token |
| `retry` | Any option of `createRetryFetch`. Set it to `false` to keep authentication and remove the waiting schedule |
| `fetch` | The transport under both wrappers, including the call to the token endpoint |
| `config` | Applied last, so it overrides any choice the factory made |

```ts
const client = createPricebooksClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
  retry: { maxAttempts: 5, deadlineMs: 60_000 },
  config: { throwOnError: true },
})
```

## Build the client yourself

Do this when you must get inside the stack: to add your own code before a request, to own the token source, or to put your own transport underneath. This package re-exports every part, so there is still one install.

```ts
import {
  clientCredentialsProvider,
  createAuthCallback,
  createAuthenticatedFetch,
  createClient,
  createConfig,
  createRetryFetch,
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
    fetch: createRetryFetch({ fetch: createAuthenticatedFetch(source) }),
  }),
)

client.interceptors.request.use((request) => {
  request.headers.set("X-Request-Id", crypto.randomUUID())
  return request
})
```

Two parts of that `fetch` line matter.

1. Build both adapters from one `source`. `createAuthenticatedFetch` decides whether an `Authorization` header is its own by comparing it with the cached token of that source. Two sources each treat the other's token as a credential that they must not change.
2. Put the authentication wrapper inside the retry wrapper. Both have the same shape and both accept a `fetch`, so the other order also compiles. In that order the number of requests multiplies, and the retry layer spends every attempt sending a request with a dead token. The `@epcc-sdk/sdks-runtime` package holds the measurements.

Your own code before a request still runs once for each real outcome. Both wrappers sit below it, so a recovered 401 or a repeated 429 never reaches your logging as a failure that the caller did not see.

## Pass the client to every operation

The generated code exports a module level `client` that holds no credentials.
An operation called without `{ client }` uses that one instead. The request then
carries no token, and the API answers with a 401 status. You must pass your own
client to every operation.

```ts
const { data } = await getPricebooks({ client })
```

## Client Usage


Clients are responsible for sending the actual HTTP requests.

The Fetch client is built as a thin wrapper on top of Fetch API, extending its functionality. If you're already familiar with Fetch, configuring your client will feel like working directly with Fetch API.

You can configure the client in two ways:

- Configuring the internal `client` instance directly
- Using the `createClient` function

**When using the operation function to make requests, by default the global client will be used unless another is provided.**


This package ships a default base URL of `https://euwest.api.elasticpath.com`.
The generator takes it from the server list in the API specification. Earlier
versions of this package shipped no default, so a request went to a relative URL.

Set `baseUrl` for your own region on every client you create. A consumer who
routes requests through a same-origin proxy must set `baseUrl` to that proxy,
because the default now sends the request straight to Elastic Path.

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
    baseUrl: 'https://useast.api.elasticpath.com', // <-- override default configuration
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
401. That is what `createAuthenticatedFetch` is for.

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