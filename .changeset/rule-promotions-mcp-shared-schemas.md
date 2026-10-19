---
"@epcc-sdk/rule-promotions": patch
---

`@epcc-sdk/rule-promotions/mcp`: a large schema that a tool's body uses in more than one place is now listed once, under `definitions`, and each place points to it with `$ref`. `rule_promotions_create_rule_promotion`'s input schema goes from 92,948 to 35,132 characters, and all the tools together from 203,312 to 87,708. The tools accept and reject the same arguments as before.
