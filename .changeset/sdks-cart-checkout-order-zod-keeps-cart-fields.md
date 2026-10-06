---
"@epcc-sdk/sdks-cart-checkout-order": patch
---

`/zod` keeps the fields of valid cart and checkout payloads instead of stripping them.

- `zCheckoutApiBody` keeps `data.account` and `data.contact` on an account checkout. A customer checkout now requires `data.customer` and an account checkout `data.contact`, as the service does, so `CustomerCheckout.data.customer` and `AccountCheckout.data.contact` are required in the TypeScript types too.
- `zManageCartsResponse`, `zCartsResponse` and `zCartItemsResponse` keep every field of custom, subscription and promotion items, which they stripped to `{}`. Their items are now `CartItemObject`, or the new `CustomItemCartObject`, `SubscriptionItemCartObject` and `PromotionItemCartObject`, each a `CartItemResponse` with a fixed `type` and a required `quantity`, in place of the request wrappers `CustomItemObject`, `SubscriptionItemObject` and `PromotionItemObject`.
- `CartsResponse.meta.display_price` keeps `shipping` and `shipping_discount`.
- `zCheckoutApiResponse` accepts an order item with an empty `product_id`, which the service returns for a custom item.
