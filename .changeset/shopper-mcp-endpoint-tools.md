---
"@epcc-sdk/sdks-shopper": minor
---

`@epcc-sdk/sdks-shopper` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its operations but `createAnAccessToken`, 149 in all, such as `getCatalogsTool`, and `tools()`, which returns all 149. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency.

The `page[limit]` and `page[offset]` query parameters of `getAllFiles` are now typed as numbers, matching the API and the `./zod` schemas. A string such as `"10"` no longer type-checks; pass `10`.
