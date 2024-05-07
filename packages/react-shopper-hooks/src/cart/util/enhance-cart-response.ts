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
        ...groupedItems.promotion,
      ],
    },
    ...cart.data,
  }
}

function getItemDiscounts(cart: ResourceIncluded<Cart, CartIncluded>) {
  const itemDiscounts = resolveItemDiscounts(cart.included?.items ?? [])

  // TODO: update sdk to have the correct display price types
  const discountsLookup = (
    cart.data.meta?.display_price as {
      discounts:
        | Record<
            string,
            { amount: number; currency: string; formatted: string }
          >
        | undefined
    }
  )?.discounts

  return itemDiscounts.map((discount) => ({
    ...discount,
    __meta: {
      ...(discountsLookup && {
        display_price: discountsLookup?.[discount.id],
      }),
    },
  }))
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
