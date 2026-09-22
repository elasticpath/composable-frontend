# @epcc-sdk/sdks-authentication-realms SDK

Below you'll find instructions on how to install, set up, and use the client, along with a list of available operations.


## Features

- type-safe response data and errors
- a one-call client factory that holds a token, refreshes it on a 401 and backs off on a 429
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology

---


## Installation

```bash
npm install @epcc-sdk/sdks-authentication-realms
# or
pnpm install @epcc-sdk/sdks-authentication-realms
# or
yarn add @epcc-sdk/sdks-authentication-realms
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
import { client } from "@epcc-sdk/sdks-authentication-realms";

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
import { createClient } from "@epcc-sdk/sdks-authentication-realms";

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

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/sdks-authentication-realms>".

```ts
const response = await getPasswordProfileInfo({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getPasswordProfileInfo({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/sdks-authentication-realms";

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
import { client } from "@epcc-sdk/sdks-authentication-realms";

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

`createAuthenticationRealmsClient` is the short way. It returns a client that holds a
caching token source, sets the `auth` hook, refreshes and replays once on a 401, and backs
off on a 429.

```ts
import {
  createAuthenticationRealmsClient,
  getAllAuthenticationRealms,
} from "@epcc-sdk/sdks-authentication-realms";

const client = createAuthenticationRealmsClient({
  baseUrl: "https://useast.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
});

const { data } = await getAllAuthenticationRealms({ client });
```

Credentials come from `source`, `provider`, `token`, `clientId` plus `clientSecret`, or
`clientId` alone for the implicit grant. `retry`, `storage`, `leewaySeconds`, `fetch` and
`config` tune the rest. `config` is merged last, so anything the factory chose can be
overridden.

Pass the client to every operation. The module-level `client` exported by this package
carries no credentials, so an operation called without `{ client }` gets a 401.

To assemble the stack by hand, `createTokenSource`, `createAuthenticatedFetch`,
`createRetryFetch` and `createConfiguredClient` are re-exported from this package, so you
still install only `@epcc-sdk/sdks-authentication-realms`. Do not authenticate with a
request interceptor: an interceptor cannot see the response, so it can never retry a 401.

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
import { getPasswordProfileInfo } from "@epcc-sdk/sdks-authentication-realms";

const product = await getPasswordProfileInfo({
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



- **`getAllAuthenticationRealms`** (`GET /v2/authentication-realms`)

- **`getAuthenticationRealm`** (`GET /v2/authentication-realms/{realmId}`)

- **`updateAuthenticationRealm`** (`PUT /v2/authentication-realms/{realmId}`)

- **`getAllOidcProfiles`** (`GET /v2/authentication-realms/{realmId}/openid-connect-profiles`)

- **`createOidcProfile`** (`POST /v2/authentication-realms/{realmId}/openid-connect-profiles`)

- **`deleteOidcProfile`** (`DELETE /v2/authentication-realms/{realmId}/openid-connect-profiles/{oidcProfileId}`)

- **`getOidcProfile`** (`GET /v2/authentication-realms/{realmId}/openid-connect-profiles/{oidcProfileId}`)

- **`updateOidcProfile`** (`PUT /v2/authentication-realms/{realmId}/openid-connect-profiles/{oidcProfileId}`)

- **`getAllPasswordProfiles`** (`GET /v2/authentication-realms/{realmId}/password-profiles`)

- **`createPasswordProfile`** (`POST /v2/authentication-realms/{realmId}/password-profiles`)

- **`deletePasswordProfile`** (`DELETE /v2/authentication-realms/{realmId}/password-profiles/{passwordProfileId}`)

- **`getPasswordProfile`** (`GET /v2/authentication-realms/{realmId}/password-profiles/{passwordProfileId}`)

- **`updatePasswordProfile`** (`PUT /v2/authentication-realms/{realmId}/password-profiles/{passwordProfileId}`)

- **`createOneTimePasswordTokenRequest`** (`POST /v2/authentication-realms/{realmId}/password-profiles/{passwordProfileId}/one-time-password-token-request`)

- **`getAllUserAuthenticationInfo`** (`GET /v2/authentication-realms/{realmId}/user-authentication-info`)

- **`createUserAuthenticationInfo`** (`POST /v2/authentication-realms/{realmId}/user-authentication-info`)

- **`deleteUserAuthenticationInfo`** (`DELETE /v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}`)

- **`getUserAuthenticationInfo`** (`GET /v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}`)

- **`updateUserAuthenticationInfo`** (`PUT /v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}`)

- **`getAllUserAuthenticationOidcProfileInfo`** (`GET /v2/authentication-realms/{realmId}/user-authentication-openid-connect-profile-info`)

- **`createUserAuthenticationOidcProfileInfo`** (`POST /v2/authentication-realms/{realmId}/user-authentication-openid-connect-profile-info`)

- **`deleteUserAuthenticationOidcProfileInfo`** (`DELETE /v2/authentication-realms/{realmId}/user-authentication-openid-connect-profile-info/{userAuthenticationOidcProfileInfoId}`)

- **`getUserAuthenticationOidcProfileInfo`** (`GET /v2/authentication-realms/{realmId}/user-authentication-openid-connect-profile-info/{userAuthenticationOidcProfileInfoId}`)

- **`updateUserAuthenticationOidcProfileInfo`** (`PUT /v2/authentication-realms/{realmId}/user-authentication-openid-connect-profile-info/{userAuthenticationOidcProfileInfoId}`)

- **`listPasswordProfileInfos`** (`GET /v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}/user-authentication-password-profile-info`)

- **`createPasswordProfileInfo`** (`POST /v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}/user-authentication-password-profile-info`)

- **`deletePasswordProfileInfo`** (`DELETE /v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}/user-authentication-password-profile-info/{userAuthenticationPasswordProfileInfoId}`)

- **`getPasswordProfileInfo`** (`GET /v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}/user-authentication-password-profile-info/{userAuthenticationPasswordProfileInfoId}`)

- **`updatePasswordProfileInfo`** (`PUT /v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}/user-authentication-password-profile-info/{userAuthenticationPasswordProfileInfoId}`)




---