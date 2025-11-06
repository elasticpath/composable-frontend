import {
  CartItemResponse,
  CartItemObject,
  SubscriptionItemObject,
} from "@epcc-sdk/sdks-shopper";

export function extractCartItemProductIds(
  items: Array<CartItemResponse>,
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
  item: NonNullable<CartItemResponse>,
): item is NonNullable<
  SubscriptionItemObject | CartItemObject
> {
  return "product_id" in item && typeof item.product_id === "string";
}
