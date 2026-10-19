---
"@epcc-sdk/sdks-pxm": minor
---

`@epcc-sdk/sdks-pxm` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 83 operations, such as `getAllProductsTool`, and `tools()`, which returns all 83. `importProductsTool` uploads a CSV file sent as a `data:` URI of at most 50 MiB. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency. The main entry does not change.
