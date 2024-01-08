import { Cart, CartIncluded, CartItem, ResourceIncluded } from "@moltin/sdk"
import { CartState, RefinedCartItem } from "../../cart"
import { groupCartItems } from "./group-cart-items"

export function enhanceCartResponse(
  cart: ResourceIncluded<Cart, CartIncluded>,
): CartState {
  const items = !!cart.included?.items
    ? enhanceCartItems(cart.included.items)
    : []

  const groupedItems = groupCartItems(cart.included?.items ?? [])

  return {
    items: items as ReadonlyArray<RefinedCartItem>,
    __extended: {
      groupedItems,
    },
    ...cart.data,
  }
}

function sortItemByCreatedAsc(a: CartItem, b: CartItem) {
  return (
    new Date(a.meta.timestamps.created_at).getTime() -
    new Date(b.meta.timestamps.created_at).getTime()
  )
}

export function enhanceCartItems(items: CartItem[]) {
  const enhanced =
    items
      ?.filter(
        (item) => item.type === "cart_item" || item.type === "custom_item",
      )
      .sort(sortItemByCreatedAsc) ?? []

  return enhanced as ReadonlyArray<RefinedCartItem>
}
