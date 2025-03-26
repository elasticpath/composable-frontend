import {
  CartItemsObjectResponse,
  CartItemResponseObject,
  SubscriptionItemResponseObject,
} from "@epcc-sdk/sdks-shopper";

export function extractCartItemProductIds(
  items: Array<CartItemsObjectResponse>,
) {
  return (
    items
      .map((item) => item)
      .filter(filterProductId)
      .map((item) => item.product_id)
      .join(",") ?? ""
  );
}

export function filterProductId(
  item: NonNullable<CartItemsObjectResponse>,
): item is NonNullable<
  SubscriptionItemResponseObject | CartItemResponseObject
> {
  return "product_id" in item && typeof item.product_id === "string";
}
