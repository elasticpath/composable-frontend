---
"@epcc-sdk/sdks-shopper": patch
---

`/zod` keeps the fields of valid cart and checkout payloads instead of stripping or rejecting them.

- `zCheckoutApiBody` keeps `data.account` and `data.contact` on an account checkout. A customer checkout now requires `data.customer` and an account checkout `data.contact`, as the service does, so `CustomerCheckout.data.customer` and `AccountCheckout.data.contact` are required in the TypeScript types too.
- `zManageCartsResponse`, `zCartsResponse` and `zCartItemsResponse` accept custom, subscription and promotion items and keep all their fields. `CustomItemCartObject`, `SubscriptionItemCartObject` and `PromotionItemCartObject` are now a `CartItemResponse` with a fixed `type` and a required `quantity`, not a request item shape, so they lose request-only fields such as `price` and `code`. `CartItemsResponse` items, which used the request wrappers, use these members.
- `CartsResponse.meta.display_price` keeps `shipping` and `shipping_discount`.
- `zCheckoutApiResponse` accepts an order item with an empty `product_id`, which the service returns for a custom item.
