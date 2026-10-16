# @epcc-sdk/sdks-mcp

Registers the Model Context Protocol (MCP) tools that an Elastic Path generated SDK exports on an
MCP server. It is used with the `/mcp` subpath of an SDK package, such as
`@epcc-sdk/sdks-catalogs/mcp`.

```sh
npm install @epcc-sdk/sdks-mcp @modelcontextprotocol/sdk zod
```

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { createCatalogsClient } from "@epcc-sdk/sdks-catalogs"
import { tools } from "@epcc-sdk/sdks-catalogs/mcp"
import { registerTools } from "@epcc-sdk/sdks-mcp"

const server = new McpServer({ name: "catalogs", version: "1.0.0" })
const client = createCatalogsClient({ baseUrl, clientId, clientSecret })
registerTools(server, tools, { client })
```

Tools from more than one package can go in one array.

The package exports three things.

- `EndpointTool` is `{ name, config, call }`. `config` holds the `title`, `description`, `inputSchema`, `annotations` and `_meta` that `McpServer.registerTool` takes. `call` takes the options of the SDK function, without `throwOnError`, and returns the MCP tool result. Change a tool by spreading it into a new object before you register it. For example, add an `outputSchema` to its `config`.
- `registerTools(server, tools, { client })` calls `server.registerTool(tool.name, tool.config, (args) => tool.call({ ...args, client }))` for each tool and returns the registered tools. The MCP SDK converts each zod `inputSchema` to JSON Schema and rejects arguments that do not match it before `call` runs. Without `client`, each SDK function uses its package's module level `client`. That client holds no credentials until you configure it, so configure it once with `client.setConfig` or give `registerTools` a client.
- `callSdk(fn, options)` is what a generated `call` runs. It calls the SDK function with the options and `throwOnError: false`, and it adds no client. Data comes back as `structuredContent`, with a JSON text copy, and data that is not an object is wrapped as `{ data }`. An API error comes back as `isError` with the text `HTTP <status>: <body>`, and a network error as `isError` with its message. It does not throw for either.

`@modelcontextprotocol/sdk` and `zod` 4 are optional peer dependencies. This package imports types only from the MCP SDK.
