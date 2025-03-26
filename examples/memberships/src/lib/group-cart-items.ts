import {
  SubscriptionItemResponseObject,
  CartItemsObjectResponse,
  CustomItemResponseObject,
  PromotionItemResponseObject,
  CartItemResponseObject,
} from "@epcc-sdk/sdks-shopper";

type Items = NonNullable<CartItemsObjectResponse>;
type ItemTypes = Items["type"];

export type Item = NonNullable<
  Exclude<
    CartItemsObjectResponse,
    PromotionItemResponseObject | CustomItemResponseObject
  >
>;

export function groupCartItems(items: CartItemsObjectResponse[]) {
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

      const custom = assertCartItemType(item, "custom_item")
        ? [...acc?.custom, item]
        : acc.custom;

      return {
        ...acc,
        ...(regular && { regular }),
        ...(subscription_offerings && { subscription_offerings }),
        ...(promotion && { promotion }),
        ...(custom && { custom }),
      };
    },
    {
      regular: [],
      subscription_offerings: [],
      promotion: [],
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
  readonly regular: NonNullable<CartItemResponseObject>[];

  /**
   * cart items of type subscription_item
   */
  readonly subscription_offerings: NonNullable<SubscriptionItemResponseObject>[];

  /**
   * cart items of type promotion_item
   */
  readonly promotion: NonNullable<PromotionItemResponseObject>[];

  /**
   * cart items of type custom_item
   */
  readonly custom: NonNullable<CustomItemResponseObject>[];
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
