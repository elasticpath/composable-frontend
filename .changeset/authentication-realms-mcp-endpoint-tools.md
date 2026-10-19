---
"@epcc-sdk/sdks-authentication-realms": minor
---

`@epcc-sdk/sdks-authentication-realms` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 31 operations, such as `getV2AuthenticationRealmsTool`, and `tools()`, which returns all 31. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency. The main entry does not change.
