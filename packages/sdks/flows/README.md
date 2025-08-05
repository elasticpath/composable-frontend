# @epcc-sdk/flows SDK

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
npm install @epcc-sdk/flows
# or
pnpm install @epcc-sdk/flows
# or
yarn add @epcc-sdk/flows
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
import { client } from "@epcc-sdk/flows";

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
import { createClient } from "@epcc-sdk/flows";

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

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/flows>".

```ts
const response = await getAFlow({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getAFlow({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/flows";

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
import { client } from "@epcc-sdk/flows";

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

We are working to provide helpers to handle auth easier for you but for now using an interceptor is the easiest method.

```ts
import { client } from "@epcc-sdk/flows";

client.interceptors.request.use((request, options) => {
  request.headers.set('Authorization', 'Bearer MY_TOKEN');
  return request;
});
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
import { getAFlow } from "@epcc-sdk/flows";

const product = await getAFlow({
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



- **`getAllFlows`** (`GET /v2/flows`)

- **`createAFlow`** (`POST /v2/flows`)

- **`deleteAFlow`** (`DELETE /v2/flows/{flowID}`)

- **`getAFlow`** (`GET /v2/flows/{flowID}`)

- **`updateAFlow`** (`PUT /v2/flows/{flowID}`)

- **`getAllFields`** (`GET /v2/fields`)

- **`createAField`** (`POST /v2/fields`)

- **`deleteAField`** (`DELETE /v2/fields/{flowFieldID}`)

- **`getAField`** (`GET /v2/fields/{flowFieldID}`)

- **`updateAField`** (`PUT /v2/fields/{flowFieldID}`)

- **`getAllEntries`** (`GET /v2/flows/{flowSlug}/entries`)

- **`createAnEntry`** (`POST /v2/flows/{flowSlug}/entries`)

- **`deleteAnEntry`** (`DELETE /v2/flows/{flowSlug}/entries/{flowEntryID}`)

- **`getAnEntry`** (`GET /v2/flows/{flowSlug}/entries/{flowEntryID}`)

- **`updateAnEntry`** (`PUT /v2/flows/{flowSlug}/entries/{flowEntryID}`)

- **`deleteAnEntryRelationship`** (`DELETE /v2/flows/{flowSlug}/entries/{flowEntryID}/relationships/{flowFieldSlug}`)

- **`createAnEntryRelationship`** (`POST /v2/flows/{flowSlug}/entries/{flowEntryID}/relationships/{flowFieldSlug}`)

- **`updateAnEntryRelationship`** (`PUT /v2/flows/{flowSlug}/entries/{flowEntryID}/relationships/{flowFieldSlug}`)

- **`getAllFieldsByFlow`** (`GET /v2/flows/{flowSlug}/fields`)




---