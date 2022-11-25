type CartItemsType = "cart_item" | "promotion_item" | "custom_item";

export function assertCartItemType<
  T extends { type?: string },
  R extends CartItemsType
>(
  obj: T,
  test: R
): obj is T & {
  type: R;
} {
  return typeof obj.type === "string" && obj.type === test;
}
