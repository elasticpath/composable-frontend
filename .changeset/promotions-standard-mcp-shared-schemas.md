---
"@epcc-sdk/promotions-standard": patch
---

`@epcc-sdk/promotions-standard/mcp`: a large schema that a tool's body uses in more than one place is now listed once, under `definitions`, and each place points to it with `$ref`. `promotions_standard_update_a_promotion`'s input schema goes from 45,544 to 20,427 characters, and all the tools together from 97,077 to 48,776. The tools accept and reject the same arguments as before.
