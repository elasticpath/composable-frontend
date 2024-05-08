import { Cart, CartIncluded, CartItem, ResourceIncluded } from "@moltin/sdk"
import { CartState, RefinedCartItem } from "../../cart"
import { groupCartItems } from "./group-cart-items"
import { resolveItemDiscounts } from "./resolve-item-discounts"

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
      getItemDiscounts: () => getItemDiscounts(cart),
      getAllDiscounts: () => [
        ...getItemDiscounts(cart),
        ...groupedItems.promotion.map((promotion) => ({
          __discount_type: "cart" as const,
          code: promotion.slug,
          id: promotion.id,
          instances: [promotion],
        })),
      ],
    },
    ...cart.data,
  }
}

function getItemDiscounts(cart: ResourceIncluded<Cart, CartIncluded>) {
  return resolveItemDiscounts(cart.included?.items ?? [])
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
