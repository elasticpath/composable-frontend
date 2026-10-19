---
"@epcc-sdk/sdks-files": minor
---

`@epcc-sdk/sdks-files` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 4 operations, such as `getAllFilesTool`, and `tools()`, which returns all 4. `createAFileTool` uploads a file sent as a `data:` URI of at most 8 MiB, named by its `file_name` argument. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency.

The `page[limit]` and `page[offset]` query parameters of `getAllFiles` are now typed as numbers, matching the API and the `./zod` schemas. A string such as `"10"` no longer type-checks; pass `10`.
