---
"@epcc-sdk/sdks-catalog-search": minor
---

`@epcc-sdk/sdks-catalog-search` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 40 operations, such as `listIndexableFieldsTool`, and `tools()`, which returns all 40. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency. The main entry does not change.
