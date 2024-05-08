import { CartItem } from "@moltin/sdk"
import { ItemDiscount, ItemDiscountInstance } from "../../cart"

function checkDiscounts(
  item: CartItem,
): item is CartItem & { discounts: ItemDiscountInstance[] } {
  return !!item.discounts
}

export function resolveItemDiscounts(
  items: Array<CartItem & { discounts?: ItemDiscountInstance[] }>,
): Array<ItemDiscount> {
  let acc: Record<string, ItemDiscount> = {}

  for (const item of items) {
    if (checkDiscounts(item)) {
      for (const discount of item.discounts) {
        if (acc[discount.code]) {
          acc[discount.code] = {
            ...acc[discount.code],
            instances: [
              ...acc[discount.code].instances,
              { ...discount, itemId: item.id, itemSku: item.sku },
            ],
          }
        } else {
          acc[discount.code] = {
            __discount_type: "item",
            id: discount.id,
            code: discount.code,
            instances: [{ ...discount, itemId: item.id, itemSku: item.sku }],
          }
        }
      }
    }
  }

  return Object.values(acc)
}
