# @epcc-sdk/flows

A TypeScript client for the Elastic Path flows API. The functions, types and Zod schemas are generated from the OpenAPI spec of the API.

## Installation

```bash
npm install @epcc-sdk/flows
```

## Quick start

```ts
import { createFlowsClient, getAllFlows } from "@epcc-sdk/flows"

const client = createFlowsClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
})

const { data, error } = await getAllFlows({ client })
```

The client gets an access token and adds it to each request. It gets a new token before the token expires. After a 401 response, it gets a new token and sends the request one more time. After a 408 or 429 response, or after some server and network errors, it waits and sends the request again.

Pass the client to each operation. The package also exports a `client` that has no credentials. If you call an operation without `{ client }`, it uses that client and the API returns a 401 response.

A failed request does not throw. The operation returns the error in `error`. To make operations throw, add `config: { throwOnError: true }` to the factory options.

## Base URL

Set `baseUrl` to the API host of your region, with no path. Each operation adds its own path.

## Credentials

| Option                        | Grant type                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `clientId` and `clientSecret` | Client credentials. Use it only on a server, because it contains a secret.               |
| `clientId`                    | Implicit. You can use it in a browser.                                                   |
| `token`                       | A token that you got yourself. The client cannot replace it, so a 401 response is final. |
| `provider`                    | Your own `TokenProvider` function.                                                       |
| `source`                      | A `TokenSource` that you keep, for example to clear the token when a user signs out.     |

These options change the default behavior:

| Option          | What it does                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `storage`       | Where the client keeps the token. The default is `memoryStorage`. `localStorageAdapter` keeps the token across page loads and browser tabs. |
| `leewaySeconds` | How many seconds before expiry the client gets a new token.                                                                                 |
| `retry`         | The options of `createRetryFetch`. Set it to `false` to stop the retries.                                                                   |
| `fetch`         | The `fetch` function that the client uses for all requests, including token requests.                                                       |
| `config`        | Client configuration, for example `headers`. It overrides the values that the factory sets.                                                 |

## Make the client yourself

The package exports the parts that the factory uses. Use them when you need your own token source or your own `fetch`.

```ts
import {
  clientCredentialsProvider,
  createAuthCallback,
  createAuthenticatedFetch,
  createClient,
  createConfig,
  createRetryFetch,
  createTokenSource,
} from "@epcc-sdk/flows"

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

1. Make both wrappers from the same `source`. `createAuthenticatedFetch` replaces only a token that came from its own source.
2. Put `createAuthenticatedFetch` inside `createRetryFetch`. In the other order, each retry sends the expired token again.

Do not add the token with a request interceptor. An interceptor cannot see the response, so it cannot get a new token after a 401 response.

## Zod schemas

The `./zod` export has a Zod schema for each request and response. `zod` 4 is an optional peer dependency, so the main export does not import it.

```ts
import { zGetAllFlowsResponse } from "@epcc-sdk/flows/zod"

const result = zGetAllFlowsResponse.safeParse(data)
```

A field that the spec gives as `int64` is a `number` in the types and in the schemas.

## MCP tools

The `./mcp` export has one Model Context Protocol (MCP) tool for each operation, for MCP SDK v2. You need `zod` 4 and `@modelcontextprotocol/server` 2 only for this export.

```ts
import { McpServer } from "@modelcontextprotocol/server"
import { tools } from "@epcc-sdk/flows/mcp"

const server = new McpServer({ name: "flows", version: "1.0.0" })

for (const tool of tools({ client })) {
  server.registerTool(tool.name, tool.config, tool.handler)
}
```

- Each tool sends its requests with the client that you give it. To send a header with each request, such as `EP-Store-Id`, set it in `config.headers` of the client.
- For one tool, use its factory. The name of the factory is the operation name with `Tool` added, for example `getAllFlowsTool`.
- The name of a tool is `flows_` and the operation name in snake case, for example `flows_get_all_flows`.
- The arguments of a tool are in `path`, `query`, `headers` and `body`. The `Authorization` header comes from the client.
- `tool.config._meta["com.elasticpath/operation"].risk` is `read`, `create`, `update` or `delete`. The tool annotations come from it. To register only the read tools, keep the tools where `risk` is `read`.
- A tool returns an API error as an `isError` result. It does not throw.
