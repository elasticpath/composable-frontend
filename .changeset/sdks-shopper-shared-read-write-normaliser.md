---
"@epcc-sdk/sdks-shopper": patch
---

Move the input normalisation that keeps the read/write split from dropping properties into a
module shared with `@epcc-sdk/sdks-cart-checkout-order`. The generated client is unchanged.
