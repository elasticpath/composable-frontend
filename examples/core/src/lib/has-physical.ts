import { getACart } from "@epcc-sdk/sdks-shopper";

export function getHasPhysicalProducts(cart: Awaited<ReturnType<typeof getACart>>["data"]) {
  return cart?.included?.items?.some(
    (item: any) =>
      item?.productDetail?.attributes?.commodity_type === "physical"
  ) ?? false;
};
