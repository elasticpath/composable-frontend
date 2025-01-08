import { CartItem } from "@elasticpath/js-sdk"
import { GroupedCartItems } from "../../cart"
import { assertCartItemType } from "./assert-cart-item-type"

export function groupCartItems(items: CartItem[]): GroupedCartItems {
  return items.reduce(
    (acc, item) => {
      return {
        ...acc,
        ...(assertCartItemType(item, "cart_item")
          ? { regular: [...acc?.regular, item] }
          : acc.regular),
        ...(assertCartItemType(item, "subscription_item")
          ? { subscription_offerings: [...acc?.subscription_offerings, item] }
          : acc.subscription_offerings),
        ...(assertCartItemType(item, "promotion_item")
          ? { promotion: [...acc?.promotion, item] }
          : acc.promotion),
        ...(assertCartItemType(item, "custom_item")
          ? { custom: [...acc?.custom, item] }
          : acc.custom),
      }
    },
    {
      regular: [],
      subscription_offerings: [],
      promotion: [],
      custom: [],
    } as GroupedCartItems,
  )
}
