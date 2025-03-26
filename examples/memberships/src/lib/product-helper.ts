import { ProductMeta } from "@epcc-sdk/sdks-shopper/dist/client/types.gen";

export const getSkuIdFromOptions = (
  options: string[],
  matrix: NonNullable<ProductMeta["variation_matrix"]>,
): string | undefined => {
  if (typeof matrix === "string") {
    return matrix;
  }

  for (const currOption in options) {
    const nestedMatrix = matrix[options[currOption]!] as NonNullable<
      ProductMeta["variation_matrix"]
    >;
    if (nestedMatrix) {
      return getSkuIdFromOptions(options, nestedMatrix);
    }
  }

  return undefined;
};

export const getOptionsFromSkuId = (
  skuId: string,
  entry: NonNullable<ProductMeta["variation_matrix"]>,
  options: string[] = [],
): string[] | undefined => {
  if (typeof entry === "string") {
    return entry === skuId ? options : undefined;
  }

  let acc: string[] | undefined;
  Object.keys(entry).every((key) => {
    const result = getOptionsFromSkuId(
      skuId,
      entry[key] as NonNullable<ProductMeta["variation_matrix"]>,
      [...options, key],
    );
    if (result) {
      acc = result;
      return false;
    }
    return true;
  });
  return acc;
};
