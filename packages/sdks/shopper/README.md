# @epcc-sdk/sdks-shopper

A TypeScript client for a storefront on Elastic Path Composable Commerce. It contains the APIs that a storefront usually calls, in one package, and manages the shopper token in the browser. The functions, types and Zod schemas are generated from the OpenAPI specs of the APIs.

## Installation

```bash
npm install @epcc-sdk/sdks-shopper
```

## Quick start

```ts
import {
  configureClient,
  getByContextAllProducts,
} from "@epcc-sdk/sdks-shopper"

configureClient(
  { baseUrl: "https://euwest.api.elasticpath.com" },
  { clientId: "your-client-id" },
)

const { data, error } = await getByContextAllProducts()
```

`configureClient` sets up the `client` that the package exports. All operations use that client when you do not give them one.

The client gets an implicit token with your client ID, so no secret goes to the browser. It adds the token to each request and gets a new token before the token expires. After a 401 response, it gets a new token and sends the request one more time. After a 408 or 429 response, or after a 5xx response to a request that is safe to send again, it waits and sends the request again.

A failed request does not throw. The operation returns the error in `error`.

## Base URL

Set `baseUrl` to the API host of your region, with no path. Each operation adds its own path.

## Authentication options

The second argument of `configureClient` takes these options:

| Option          | What it does                                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `clientId`      | The client ID of your store. It is required.                                                                          |
| `storage`       | Where the client keeps the token: `"localStorage"` (the default), `"cookie"`, or your own `StorageAdapter`.           |
| `cookie`        | The cookie options, for example `sameSite`, `secure` and `maxAge`, when `storage` is `"cookie"`.                      |
| `tokenProvider` | Your own function that gets a token, in place of the implicit grant.                                                  |
| `retry`         | The options of `createRetryFetch`. Set it to `false` to stop the retries. The client still gets new tokens.           |
| `wrapUserFetch` | If you give a `fetch` in the first argument, the client adds authentication and retries to it. The default is `true`. |

With `"localStorage"`, all browser tabs use the same token. With `"cookie"`, the cookie is readable by JavaScript.

## A separate client

`createShopperClient` takes the same arguments and returns a new client. Use it for more than one store, or when you do not want to change the exported `client`. Give this client to each operation.

```ts
import {
  createShopperClient,
  getByContextAllProducts,
} from "@epcc-sdk/sdks-shopper"

const { client, auth } = createShopperClient(
  { baseUrl: "https://euwest.api.elasticpath.com" },
  { clientId: "your-client-id" },
)

const { data } = await getByContextAllProducts({ client })
```

Both functions return `{ client, auth }`. Use `auth` to control the token:

```ts
const token = await auth.getValidAccessToken()
const current = auth.getSnapshot()
await auth.refresh()
auth.clear()
```

`getValidAccessToken` returns the token and gets a new one if necessary. `getSnapshot` returns the stored token and sends no request. `refresh` gets a new token. `clear` removes the stored token.

## Carts

`initializeCart` returns the ID of the cart of the shopper. If the browser has no cart ID in `localStorage`, it makes a cart and stores its ID. `getCartId` reads the stored ID. Both use the exported `client`, so call `configureClient` first.

```ts
import { getCartItems, initializeCart } from "@epcc-sdk/sdks-shopper"

const cartId = await initializeCart()
const { data } = await getCartItems({ path: { cartID: cartId } })
```

## React Query

The `./react-query` export has query options, query keys and mutations for TanStack Query 5. Install `@tanstack/react-query` only if you use this export.

```ts
import { useQuery } from "@tanstack/react-query"
import { getByContextProductOptions } from "@epcc-sdk/sdks-shopper/react-query"

const { data } = useQuery(
  getByContextProductOptions({ path: { product_id: productId } }),
)
```

The options use the exported `client` when you do not give them one, so call `configureClient` first.

## Zod schemas

The `./zod` export has a Zod schema for each request and response. `zod` 4 is an optional peer dependency, so the main export does not import it.

```ts
import { zGetByContextAllProductsResponse } from "@epcc-sdk/sdks-shopper/zod"

const result = zGetByContextAllProductsResponse.safeParse(data)
```

A field that the spec gives as `int64` is a `number` in the types and in the schemas.

## Make the client yourself

The package exports the parts that `createShopperClient` uses: `createTokenSource`, `implicitProvider`, `createAuthCallback`, `createAuthenticatedFetch`, `createRetryFetch`, `localStorageAdapter`, `memoryStorage`, `createClient` and `createConfig`. Use them when you need your own token source or your own `fetch`.

1. Make `createAuthCallback` and `createAuthenticatedFetch` from the same token source. `createAuthenticatedFetch` replaces only a token that came from its own source.
2. Put `createAuthenticatedFetch` inside `createRetryFetch`. In the other order, each retry sends the expired token again.

Do not add the token with a request interceptor. An interceptor cannot see the response, so it cannot get a new token after a 401 response.
