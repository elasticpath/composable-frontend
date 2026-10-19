---
"@epcc-sdk/sdks-inventories": minor
---

`@epcc-sdk/sdks-inventories` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 18 operations, such as `listStockTool`, and `tools()`, which returns all 18. `createImportTool` uploads a JSONL file sent as a `data:` URI of at most 8 MiB. Location operations need the `EP-Inventories-Multi-Location: true` header on the client. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency. The main entry does not change.
