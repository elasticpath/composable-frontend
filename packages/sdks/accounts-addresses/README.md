# @epcc-sdk/sdks-accounts-addresses SDK

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
npm install @epcc-sdk/sdks-accounts-addresses
# or
pnpm install @epcc-sdk/sdks-accounts-addresses
# or
yarn add @epcc-sdk/sdks-accounts-addresses
```

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
import { client } from "@epcc-sdk/sdks-accounts-addresses";

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
import { createClient } from "@epcc-sdk/sdks-accounts-addresses";

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

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/sdks-accounts-addresses>".

```ts
const response = await getV2AccountAddress({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getV2AccountAddress({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/sdks-accounts-addresses";

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
import { client } from "@epcc-sdk/sdks-accounts-addresses";

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

`createAccountsAddressesClient` is the short way. It returns a client that holds a caching
token source, sets the `auth` hook, refreshes and replays once on a 401, and backs off on
a 429.

```ts
import {
  createAccountsAddressesClient,
  getV2AccountAddresses,
} from "@epcc-sdk/sdks-accounts-addresses";

const client = createAccountsAddressesClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
});

const { data } = await getV2AccountAddresses({
  client,
  path: { accountID: "…" },
});
```

Credentials come from `source`, `provider`, `token`, `clientId` plus `clientSecret`, or
`clientId` alone for the implicit grant. `retry`, `storage`, `leewaySeconds`, `fetch` and
`config` tune the rest. `config` is merged last, so anything the factory chose can be
overridden.

Pass the client to every operation. The module-level `client` exported by this package
carries no credentials, so an operation called without `{ client }` gets a 401.

To assemble the stack by hand, `createTokenSource`, `createAuthenticatedFetch`,
`createRetryFetch` and `createConfiguredClient` are re-exported from this package, so you
still install only `@epcc-sdk/sdks-accounts-addresses`. Do not authenticate with a request
interceptor: an interceptor cannot see the response, so it can never retry a 401.

These endpoints accept either a client credentials token, or an implicit token combined
with an
[Account Management authentication](https://elasticpath.dev/docs/api/accounts/post-v-2-account-members-tokens)
token, which you set as the `EP-Account-Management-Authentication-Token` header.

## Validation schemas

Zod schemas for every request body, path and response are published under the `/zod`
subpath. `zod` is an optional peer dependency (3.x), so the root entry never imports it.

```ts
import { zAccountAddressResponse } from "@epcc-sdk/sdks-accounts-addresses/zod";

const address = zAccountAddressResponse.parse(data.data[0]);
```

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
import { getV2AccountAddress } from "@epcc-sdk/sdks-accounts-addresses";

const product = await getV2AccountAddress({
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



- **`getV2AccountAddresses`** (`GET /v2/accounts/{accountID}/addresses`)

- **`postV2AccountAddress`** (`POST /v2/accounts/{accountID}/addresses`)

- **`deleteV2AccountAddress`** (`DELETE /v2/accounts/{accountID}/addresses/{addressID}`)

- **`getV2AccountAddress`** (`GET /v2/accounts/{accountID}/addresses/{addressID}`)

- **`putV2AccountAddress`** (`PUT /v2/accounts/{accountID}/addresses/{addressID}`)




---