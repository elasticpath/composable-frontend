---
"@epcc-sdk/promotions-standard": minor
---

`@epcc-sdk/promotions-standard` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 14 operations, such as `getAllPromotionsTool`, and `tools()`, which returns all 14. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency. The main entry does not change.

The body of `createPromotionCodes` is now typed as `{ data: { type, codes } }`, which is what the service reads. The spec showed the codes unwrapped, where the service does not read them.
