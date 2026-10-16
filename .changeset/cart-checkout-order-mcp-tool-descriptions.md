---
"@epcc-sdk/sdks-cart-checkout-order": patch
---

`@epcc-sdk/sdks-cart-checkout-order/mcp`: each of the 60 tools now has a short description written for a model choosing between tools, at most 600 characters, in place of the operation's full spec description. The full spec description stays in the doc comment of the function and its tool factory. Six titles change where the spec summary was vague or wrong: the three tax item tools that act on one cart item now say "Cart Item", `cart_checkout_order_checkout_api` is "Check Out a Cart", `cart_checkout_order_payment_setup` is "Pay for an Order" and `cart_checkout_order_confirm_payment` is "Confirm a Transaction".
