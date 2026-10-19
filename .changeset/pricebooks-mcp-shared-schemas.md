---
"@epcc-sdk/sdks-pricebooks": patch
---

`@epcc-sdk/pricebooks/mcp`: a large schema that a tool's body uses in more than one place is now listed once, under `definitions`, and each place points to it with `$ref`. `pricebooks_update_product_price`'s input schema goes from 8,165 to 7,050 characters, and all the tools together from 29,545 to 27,297. The tools accept and reject the same arguments as before.
