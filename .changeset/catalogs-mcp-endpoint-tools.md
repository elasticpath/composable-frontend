---
"@epcc-sdk/sdks-catalogs": minor
"@epcc-sdk/sdks-mcp": minor
---

`@epcc-sdk/sdks-catalogs` has a new `/mcp` export. It exports one Model Context Protocol (MCP) tool for each of its 30 operations, such as `getCatalogsTool`, and `tools`, an array of all 30. A tool's `call` takes the same options as its SDK function, and without a `client` it uses the package's module level `client`, which holds no credentials until you configure it. The main entry does not change.

`@epcc-sdk/sdks-mcp` is a new package. It has the `EndpointTool` type, `registerTools(server, tools, { client })`, and the `callSdk` helper that the generated tools call.
