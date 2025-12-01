import {
  CartIncluded,
  CartItemObject,
  SubscriptionItemCartObject,
  PromotionItemCartObject,
  CustomItemCartObject,
} from "@epcc-sdk/sdks-shopper";

type Items = NonNullable<CartIncluded["items"]>;
type ItemTypes = Items[number]["type"];

export type Item = Exclude<
  NonNullable<CartIncluded["items"]>[number],
  PromotionItemCartObject | CustomItemCartObject
>;

export function groupCartItems(items: Items) {
  return items.reduce(
    (acc, item) => {
      if (!item) {
        return acc;
      }

      const regular = assertCartItemType(item, "cart_item")
        ? [...acc.regular, item]
        : acc.regular;

      const subscription_offerings = assertCartItemType(
        item,
        "subscription_item",
      )
        ? [...acc?.subscription_offerings, item]
        : acc.subscription_offerings;

      const promotion = assertCartItemType(item, "promotion_item")
        ? [...acc?.promotion, item]
        : acc.promotion;

      const itemDiscounts = (item as any)?.discounts || [];
      const itemLevelPromotion = [...acc.itemLevelPromotion];
      if (!assertCartItemType(item, "promotion_item") && itemDiscounts.length) {
        itemDiscounts.forEach((discount: any) => {
          const exists = itemLevelPromotion.some(
            (d: any) =>
              d.id === discount.id ||
              d.code === discount.code ||
              d.promotion_id === discount.id ||
              d.sku === discount.code
          );
          if (!exists) {
            itemLevelPromotion.push(discount);
          }
        });
      }

      const custom = assertCartItemType(item, "custom_item")
        ? [...acc?.custom, item]
        : acc.custom;

      return {
        ...acc,
        ...(regular && { regular }),
        ...(subscription_offerings && { subscription_offerings }),
        ...(promotion && { promotion }),
        ...(itemLevelPromotion && { itemLevelPromotion }),
        ...(custom && { custom }),
      };
    },
    {
      regular: [],
      subscription_offerings: [],
      promotion: [],
      itemLevelPromotion: [],
      custom: [],
    } as GroupedCartItems,
  );
}

/**
 * Cart items seperated into their respective groups by type property
 * cart_item, promotion_item and custom_item.
 */
export interface GroupedCartItems {
  /**
   * cart items of type cart_item
   */
  readonly regular: NonNullable<CartItemObject>[];

  /**
   * cart items of type subscription_item
   */
  readonly subscription_offerings: NonNullable<SubscriptionItemCartObject>[];

  /**
   * cart items of type promotion_item
   */
  readonly promotion: NonNullable<PromotionItemCartObject>[];

  /**
   * item level discount
   */
  readonly itemLevelPromotion: any[];

  /**
   * cart items of type custom_item
   */
  readonly custom: NonNullable<CustomItemCartObject>[];
}

export function assertCartItemType<
  T extends { type?: ItemTypes },
  R extends ItemTypes,
>(
  obj: T,
  test: R,
): obj is T & {
  type: R;
} {
  return typeof obj.type === "string" && obj.type === test;
}
