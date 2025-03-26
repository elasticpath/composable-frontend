import { ProductMeta } from "@epcc-sdk/sdks-shopper";

export const getOptionsFromProductId = (
  skuId: string,
  entry: NonNullable<ProductMeta["variation_matrix"]>,
  options: string[] = [],
): string[] | undefined => {
  if (typeof entry === "string") {
    return entry === skuId ? options : undefined;
  }

  let acc: string[] | undefined;
  Object.keys(entry).every((key) => {
    const result = getOptionsFromProductId(skuId, entry[key] as any, [
      ...options,
      key,
    ]);
    if (result) {
      acc = result;
      return false;
    }
    return true;
  });
  return acc;
};
