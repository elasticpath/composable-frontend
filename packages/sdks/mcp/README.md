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
import { createTools } from "@epcc-sdk/sdks-catalogs/mcp"
import { registerTools } from "@epcc-sdk/sdks-mcp"

const server = new McpServer({ name: "catalogs", version: "1.0.0" })
registerTools(
  server,
  createTools(createCatalogsClient({ baseUrl, clientId, clientSecret })),
)
```

The package exports three things.

- `EndpointTool` is `{ name, config, handler }`. `config` holds the `title`, `description`, `inputSchema`, `annotations` and `_meta` that `McpServer.registerTool` takes. Change a tool with `.filter` or `.map` before you register it. For example, add an `outputSchema` to its `config`.
- `registerTools(server, tools)` calls `server.registerTool(tool.name, tool.config, tool.handler)` for each tool and returns the registered tools. The MCP SDK converts each zod `inputSchema` to JSON Schema and rejects arguments that do not match it before the handler runs.
- `callSdk(fn, client, args)` is what a generated handler calls. It calls the SDK function with the client and the `path`, `query`, `headers` and `body` arguments. Data comes back as `structuredContent`, with a JSON text copy, and data that is not an object is wrapped as `{ data }`. An API error comes back as `isError` with the text `HTTP <status>: <body>`, and a network error as `isError` with its message. It does not throw for either.

`@modelcontextprotocol/sdk` and `zod` 4 are optional peer dependencies. This package imports types only from the MCP SDK.
