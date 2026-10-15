---
"@epcc-sdk/sdks-catalogs": minor
"@epcc-sdk/sdks-runtime": minor
---

`@epcc-sdk/sdks-catalogs` has a new `/mcp` export. It holds the facts for each of its 30 operations, such as the method, path, risk tier and paging parameters, and binds each one to its SDK function and zod schemas. The main entry does not change.

`@epcc-sdk/sdks-runtime` has a new `/mcp` export that builds Model Context Protocol (MCP) endpoint tools from those operations, and calls them. Each tool's input schema is converted from the zod schemas into JSON Schema 2020-12. Unknown path, query and header keys are rejected, and the `Authorization` header is left out. Output schemas are added only when you ask for them. The `formatResult` and `mapError` hooks and a per-tool `validate` override change how a call is handled, and every failure is a `ToolCallError`. `zod` 4 and `@modelcontextprotocol/sdk` are optional peer dependencies of the runtime, and the MCP SDK supplies types only.
