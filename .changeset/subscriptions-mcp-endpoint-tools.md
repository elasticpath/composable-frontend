---
"@epcc-sdk/sdks-subscriptions": minor
---

`@epcc-sdk/sdks-subscriptions` has a new `/mcp` export. It has one Model Context Protocol (MCP) tool factory for each of its 86 operations, such as `listOfferingsTool`, and `tools()`, which returns all 86. `createImportTool` uploads a JSONL file sent as a `data:` URI of at most 8 MiB. A factory returns the `name`, `config` and `handler` that `McpServer.registerTool` takes. Without a `client`, a tool uses the package's module level `client`, which has no credentials until you configure it. `@modelcontextprotocol/sdk` is an optional peer dependency.

`FeaturePlanConfigurationUpdate`, `NullablePaymentAuthority` and `NullablePaymentAuthorityWritable` now include `null`, as the API and the `./zod` schemas already did. An offering plan update can send `null` for a feature configuration to remove it, and a subscriber update can send `payment_authority: null` to clear it.
