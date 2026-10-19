---
"@epcc-sdk/subscriptions": patch
---

`@epcc-sdk/subscriptions/mcp`: a large schema that a tool's body uses in more than one place is now listed once, under `definitions`, and each place points to it with `$ref`. `subscriptions_build_offering`'s input schema goes from 13,820 to 12,490 characters, and all the tools together from 166,548 to 165,218. The tools accept and reject the same arguments as before.
