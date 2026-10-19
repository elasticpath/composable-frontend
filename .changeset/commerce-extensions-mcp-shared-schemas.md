---
"@epcc-sdk/commerce-extensions": patch
---

`@epcc-sdk/commerce-extensions/mcp`: a large schema that a tool's body uses in more than one place is now listed once, under `definitions`, and each place points to it with `$ref`. `commerce_extensions_create_a_custom_field`'s input schema goes from 15,737 to 8,548 characters, and all the tools together from 48,065 to 40,876. The tools accept and reject the same arguments as before.
