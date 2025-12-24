export function extractCartItemProductIds(
  items: Array<{ product_id?: string }>,
) {
  return (
    items
      .map((item) => item)
      .map((item) => item.product_id)
      .join(",") ?? ""
  );
}
