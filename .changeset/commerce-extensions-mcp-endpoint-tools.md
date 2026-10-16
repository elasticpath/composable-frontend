---
"@epcc-sdk/commerce-extensions": minor
---

`@epcc-sdk/commerce-extensions` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 21 operations, such as `listCustomApisTool`, and `tools()`, which returns all 21. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency. The main entry does not change.
