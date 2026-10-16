---
"@epcc-sdk/sdks-pricebooks": minor
---

`@epcc-sdk/sdks-pricebooks` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 18 operations, such as `getPricebooksTool`, and `tools()`, which returns all 18. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency. The main entry does not change.
