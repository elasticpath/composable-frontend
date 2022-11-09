import { CartItem } from "@moltin/sdk"
import { GroupedCartItems } from "@lib/cart"
import { assertCartItemType } from "./assert-cart-item-type"

export function groupCartItems(items: CartItem[]): GroupedCartItems {
  return items.reduce(
    (acc, item) => {
      return {
        ...acc,
        ...(assertCartItemType(item, "cart_item")
          ? { regular: [...acc?.regular, item] }
          : acc.regular),
        ...(assertCartItemType(item, "promotion_item")
          ? { promotion: [...acc?.promotion, item] }
          : acc.promotion),
        ...(assertCartItemType(item, "custom_item")
          ? { custom: [...acc?.custom, item] }
          : acc.custom)
      }
    },
    {
      regular: [],
      promotion: [],
      custom: []
    } as GroupedCartItems
  )
}
