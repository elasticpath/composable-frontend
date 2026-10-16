---
"@epcc-sdk/settings": minor
---

`@epcc-sdk/settings` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 3 operations, such as `getV2SettingsTool`, and `tools()`, which returns all 3. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency. The main entry does not change.
