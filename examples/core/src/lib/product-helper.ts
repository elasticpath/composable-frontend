import type { ProductData, ProductMeta } from "@epcc-sdk/sdks-shopper";

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

export function getProductKeywords(product: ProductData): string | undefined {
  const extensions = product.data?.attributes?.extensions;

  if (!extensions) {
    return undefined;
  }

  for (const key in extensions) {
    const extensionValue = extensions[key];
    if (extensionValue && typeof extensionValue === 'object' && 'keywords' in extensionValue) {
      const keywordValue = (extensionValue as { keywords: unknown }).keywords;
      if (typeof keywordValue === 'string') {
        return keywordValue; 
      }
    }
  }
  return undefined;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};  

export function getProductURLSegment(product: DeepPartial<any>): string{
  let productSlugSegment ='';
  if (product?.attributes?.slug){
    productSlugSegment=`${product?.attributes?.slug}/`;
  }
  
  return `/products/${productSlugSegment}${product.id}`;
}
