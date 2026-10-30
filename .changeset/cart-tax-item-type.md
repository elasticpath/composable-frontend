---
"@epcc-sdk/sdks-cart-checkout-order": patch
---

Default a tax item's `type` to `tax_item`, its only value, and type its `amount` as an integer, as orders.svc decodes it.
