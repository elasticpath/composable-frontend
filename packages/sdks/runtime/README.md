# @epcc-sdk/sdks-runtime

Authentication and retries for the generated Elastic Path SDK packages. A generated package calls the API, but it does not get access tokens and it does not send a failed request again. This package does both. It works in Node and in a browser, with any generated client.

Each API client package, for example `@epcc-sdk/sdks-pricebooks`, uses this package in its `create*Client` factory and exports its parts. Use this package directly only for a client that does not have a factory.

## Installation

```bash
npm install @epcc-sdk/sdks-runtime
```

## Quick start

```ts
import { createClient, createConfig } from "@epcc-sdk/sdks-pricebooks"
import type { Client, Config } from "@epcc-sdk/sdks-pricebooks"
import { createConfiguredClient } from "@epcc-sdk/sdks-runtime"

const client = createConfiguredClient<Client, Config>(
  { createClient, createConfig },
  {
    baseUrl: "https://euwest.api.elasticpath.com",
    clientId: process.env.EPCC_CLIENT_ID!,
    clientSecret: process.env.EPCC_CLIENT_SECRET!,
  },
)
```

Give the `Client` and `Config` types of the generated client as type arguments. TypeScript cannot infer them from the options.

The client gets an access token and adds it to each request. It gets a new token before the token expires. After a 401 response, it gets a new token and sends the request one more time. After a 408 or 429 response, or after some server and network errors, it waits and sends the request again.

## Options

The factory uses the first credential that you give, in this order:

| Option                        | Grant type                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `source`                      | A `TokenSource` that you keep, for example to clear the token when a user signs out.     |
| `provider`                    | Your own `TokenProvider` function.                                                       |
| `token`                       | A token that you got yourself. The client cannot replace it, so a 401 response is final. |
| `clientId` and `clientSecret` | Client credentials. Use it only on a server, because it contains a secret.               |
| `clientId`                    | Implicit. You can use it in a browser.                                                   |

These options change the default behavior:

| Option          | What it does                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `storage`       | Where the client keeps the token. The default is `memoryStorage`. `localStorageAdapter` keeps the token across page loads and browser tabs. |
| `leewaySeconds` | How many seconds before expiry the client gets a new token. The default is 60.                                                              |
| `retry`         | The options of `createRetryFetch`. Set it to `false` to stop the retries. The client still gets new tokens.                                 |
| `fetch`         | The `fetch` function that the client uses for all requests, including token requests.                                                       |
| `config`        | Client configuration, for example `headers`. It overrides the values that the factory sets.                                                 |
| `onSource`      | A function that receives the token source of the client, so that you can call `clear` or `dispose`.                                         |

## The parts

| Part            | Functions                                                                 |
| --------------- | ------------------------------------------------------------------------- |
| Token providers | `clientCredentialsProvider`, `implicitProvider`, `staticTokenProvider`    |
| Storage         | `memoryStorage`, `localStorageAdapter`                                    |
| Token source    | `createTokenSource`. It keeps the token and gets a new one before expiry. |
| Client adapters | `createAuthCallback`, `createAuthenticatedFetch`                          |
| Retry           | `createRetryFetch`, also in the `./retry` export without the token code   |

To make a client from the parts, use both adapters from one token source:

```ts
import { createClient, createConfig } from "@epcc-sdk/sdks-pricebooks"
import {
  clientCredentialsProvider,
  createAuthCallback,
  createAuthenticatedFetch,
  createRetryFetch,
  createTokenSource,
} from "@epcc-sdk/sdks-runtime"

const source = createTokenSource(
  clientCredentialsProvider({
    baseUrl: "https://euwest.api.elasticpath.com",
    clientId: process.env.EPCC_CLIENT_ID!,
    clientSecret: process.env.EPCC_CLIENT_SECRET!,
  }),
)

const client = createClient(
  createConfig({
    baseUrl: "https://euwest.api.elasticpath.com",
    auth: createAuthCallback(source),
    fetch: createRetryFetch({ fetch: createAuthenticatedFetch(source) }),
  }),
)
```

- `createAuthCallback` adds the token to each request.
- `createAuthenticatedFetch` sees the response. After a 401 response, it gets a new token and sends the request one more time. It replaces only a token that came from its own source, so make both adapters from the same source.
- Put `createAuthenticatedFetch` inside `createRetryFetch`. In the other order, each retry sends the expired token again, and one 401 response can cause six requests.

Do not add the token with a request interceptor. An interceptor cannot see the response, so it cannot get a new token after a 401 response.

For a browser, use `implicitProvider` with your client ID and `localStorageAdapter()`. Then the token stays after a page load and all tabs use the same token. `localStorageAdapter` does nothing on a server, so you can import it in code that renders on the server.

## Retry

`createRetryFetch` sends a request again only when that is safe:

| Failure                                                                 | Sent again for                              |
| ----------------------------------------------------------------------- | ------------------------------------------- |
| Status 408 and 429                                                      | All methods                                 |
| Status 500, 502, 503 and 504                                            | GET, HEAD, PUT, DELETE, OPTIONS and TRACE   |
| `ECONNREFUSED`, `ENOTFOUND`, `EAI_AGAIN`, `ENETUNREACH`, `EHOSTUNREACH` | All methods, because no connection was made |
| `ECONNRESET`, `EPIPE` and socket timeouts                               | GET, HEAD, PUT, DELETE, OPTIONS and TRACE   |
| Status 401, 403, 501 and other 4xx statuses                             | No method                                   |
| An abort from your `AbortSignal`                                        | No method. The abort also stops a wait.     |

A POST is not sent again after a 5xx response, because the server can apply the request and lose the response. To retry an endpoint that you know is safe, give your own `shouldRetryStatus` or `shouldRetryError`.

```ts
import { createRetryFetch } from "@epcc-sdk/sdks-runtime/retry"

const fetchWithRetry = createRetryFetch({
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 20_000,
  deadlineMs: 30_000,
})
```

- `maxAttempts` is the number of sends, including the first. It must be 1 or more.
- Each wait is longer than the last, from `baseDelayMs` to `maxDelayMs`, with a random offset. `jitter` and `backoff` change the curve.
- If the response has a `Retry-After` header, the wait comes from the header. `maxRetryAfterMs` limits that wait. The default is `maxDelayMs`.
- `deadlineMs` limits the total time. If the next wait goes past it, the last response is returned.
- `onEvent` receives a `send`, `outcome`, `wait` or `give-up` event for each step.

The retry copies the request body and keeps it until the last attempt. A large upload stays in memory for that time.

## Errors

A failed token request throws a `TokenRequestError`. Its `reason` tells you the type of failure:

| `reason`        | What happened                                                      | `status`            |
| --------------- | ------------------------------------------------------------------ | ------------------- |
| `http`          | The endpoint returned a status that is not 2xx.                    | The response status |
| `parse`         | The endpoint returned 2xx, but the body is not JSON.               | The response status |
| `missing_token` | The endpoint returned 2xx JSON with no `access_token`.             | The response status |
| `network`       | No response, for example a DNS, TLS or connection error, or abort. | `0`                 |

The error also has `body`, and a `network` error has `cause`. To throw your own error type, give `mapError` to `clientCredentialsProvider` or `implicitProvider`. It receives `{ reason, status, body, url, message, cause? }`. If it returns nothing, the `TokenRequestError` is thrown.

```ts
const provider = clientCredentialsProvider({
  baseUrl,
  clientId,
  clientSecret,
  mapError: (failure) => new AuthenticationError(failure.message),
})
```

## Token behavior

- The token source reads the expiry from `expires_in`, then `expires`, then the `exp` claim of a JWT. If the token has none of them, the source keeps it until a 401 response.
- If many requests need a new token at the same time, the source sends one token request.
- A failed token request is not kept. The next request tries again.
- The client sends a request again after a 401 response only one time. A second 401 response is returned, not thrown.
- A request to a URL that contains `/oauth/` does not get a token. To change this, give `isAuthRequest`.
- If a request already has an `Authorization` header from a different source, the client does not change it and does not send the request again.

## Dispose of a token source

A token source listens to its storage adapter, so that it sees a token that another tab writes. Call `source.dispose()` to stop it. With the default `memoryStorage`, this is not necessary. If you make a client for each request with a shared storage adapter, dispose of each source. Use `onSource` to get the source from `createConfiguredClient`.

## Your own transport

`createAuthenticatedFetch(source, { fetch })` sends each attempt through the `fetch` that you give. Use it for a proxy, for logging, or to stop at the first 401 response:

```ts
const transport: typeof fetch = async (input, init) => {
  const response = await fetch(input, init)
  if (response.status === 401) throw new MyAuthError("The token was rejected.")
  return response
}

const authFetch = createAuthenticatedFetch(source, { fetch: transport })
```

Do not put `createRetryFetch` here. It goes outside `createAuthenticatedFetch`.

`createAuthenticatedFetch` always gives your `fetch` one `Request` object, not a URL and options.

## Your own storage

A storage adapter has a `get` method, a `set` method and an optional `subscribe` method. `set` with no value removes the token.

```ts
const adapter: StorageAdapter = {
  get: () => cookies().get("token")?.value,
  set: (value) =>
    value ? cookies().set("token", value) : cookies().delete("token"),
}
```

The package has no cookie adapter, because a cookie that JavaScript can read exposes the token to cross-site scripting.
