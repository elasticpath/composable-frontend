---
"@epcc-sdk/sdks-accounts": minor
---

`@epcc-sdk/sdks-accounts` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 28 operations, such as `getV2AccountsTool`, and `tools()`, which returns all 28. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency. The main entry does not change.
