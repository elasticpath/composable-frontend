---
"@epcc-sdk/sdks-catalogs": minor
---

`@epcc-sdk/sdks-catalogs` now includes the 16 shopper catalog operations under `/catalog`, the reads a storefront makes, chosen by catalog rules from the shopper's context: `getByContextRelease`, the `getByContext*` hierarchy, node and product reads, and `configureByContextProduct`. Each has an SDK function and an MCP tool, so `tools()` now returns 46. Nothing existing changes.
