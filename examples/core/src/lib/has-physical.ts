import { getACart } from "@epcc-sdk/sdks-shopper";

export function getHasPhysicalProducts(cart: Awaited<ReturnType<typeof getACart>>["data"]) {
  return cart?.included?.items?.some(
    (item: any) =>
      // default hasPhysical to true if no product details found
      item?.productDetail?.attributes?.commodity_type !== "digital"
  ) ?? false;
};
