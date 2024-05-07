import { CartItem } from "@moltin/sdk"
import { ItemDiscount } from "../../cart"

function checkDiscounts(
  item: CartItem,
): item is CartItem & { discounts: ItemDiscount } {
  return !!item.discounts
}

export function resolveItemDiscounts(
  items: Array<CartItem & { discounts?: ItemDiscount }>,
): Array<ItemDiscount> {
  const itemDiscounts = items
    .filter(checkDiscounts)
    .map((item) => item.discounts)
  return Array.from(new Set(itemDiscounts))
}
