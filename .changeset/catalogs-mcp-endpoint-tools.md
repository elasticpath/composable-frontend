---
"@epcc-sdk/sdks-catalogs": minor
"@epcc-sdk/sdks-mcp": minor
---

`@epcc-sdk/sdks-catalogs` has a new `/mcp` export. `createTools(client)` returns one Model Context Protocol (MCP) tool for each of its 30 operations, ready for `McpServer.registerTool`. The main entry does not change.

`@epcc-sdk/sdks-mcp` is a new package. It has the `EndpointTool` type, `registerTools(server, tools)`, and the `callSdk` helper that the generated tools call.
