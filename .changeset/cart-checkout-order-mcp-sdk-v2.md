---
"@epcc-sdk/sdks-cart-checkout-order": minor
---

The `/mcp` export now targets MCP SDK v2. Register its tools on an `McpServer` from `@modelcontextprotocol/server` with no adapter. The optional peer dependency is now `@modelcontextprotocol/server` `^2`, in place of `@modelcontextprotocol/sdk`.

This is a breaking change for `/mcp` consumers:

- `Tool`, `ToolConfig` and each handler use v2's types. `outputSchema` is a Standard Schema.
- A handler takes v2's request context as its second argument and passes `ctx.mcpReq.signal` to the API call, so a cancelled MCP request aborts it. A wrapped handler passes `ctx` through as before.

Tool names, descriptions, risk tiers and zod schemas do not change. MCP SDK v2 lists input schemas as JSON Schema 2020-12, so a schema shared within a tool's input is now listed under `$defs` in place of `definitions`. The main entry does not change.
