---
"@epcc-sdk/cart-checkout-order": patch
---

`@epcc-sdk/cart-checkout-order/mcp`: a large schema that a tool's body uses in more than one place is now listed once, under `definitions`, and each place points to it with `$ref`. `cart_checkout_order_manage_carts`'s input schema goes from 14,862 to 10,790 characters, and all the tools together from 127,441 to 116,248. The tools accept and reject the same arguments as before.
