import { Cart, CartIncluded, ResourceIncluded } from "@moltin/sdk"
import { CartState, CustomCartItem, RegularCartItem } from "@lib/cart"
import { isNonEmpty } from "@lib/shared/types/read-only-non-empty-array"
import { groupCartItems } from "./group-cart-items"
import { calculateCartNumbers } from "../cart-reducer"

export function getInitialState(
  cart?: ResourceIncluded<Cart, CartIncluded>
): CartState {
  if (!cart) {
    return {
      kind: "uninitialised-cart-state"
    }
  }

  if (!cart.included?.items) {
    return {
      kind: "empty-cart-state",
      id: cart.data.id
    }
  }

  const items = cart.included.items.filter(
    item => item.type === "cart_item" || item.type === "custom_item"
  ) as (RegularCartItem | CustomCartItem)[]

  if (!isNonEmpty(items)) {
    return {
      kind: "empty-cart-state",
      id: cart.data.id
    }
  }

  const groupedItems = groupCartItems(cart.included.items)
  return {
    kind: "present-cart-state",
    items,
    groupedItems: groupedItems,
    id: cart.data.id,
    ...calculateCartNumbers(cart.data.meta)
  }
}
