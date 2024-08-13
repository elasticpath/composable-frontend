import type {
  CatalogsProductVariation,
  File,
  ProductResponse,
} from "@elasticpath/js-sdk";
import type {
  IdentifiableBaseProduct,
  OptionDict,
} from "./types/product-types";

export function processImageFiles(files: File[], mainImageId?: string) {
  // filters out main image and keeps server order
  const supportedMimeTypes = [
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ];
  return files.filter(
    (fileEntry) =>
      fileEntry.id !== mainImageId &&
      supportedMimeTypes.some((type) => fileEntry.mime_type === type),
  );
}

export function getProductMainImage(
  mainImages: File[] | undefined,
): File | null {
  return mainImages?.[0] || null;
}

// Using existance of parent relationship property to filter because only child products seem to have this property.
export const filterBaseProducts = (
  products: ProductResponse[],
): IdentifiableBaseProduct[] =>
  products.filter(
    (product: ProductResponse): product is IdentifiableBaseProduct =>
      product.attributes.base_product,
  );

// Using existance of parent relationship property to filter because only child products seem to have this property.
export const excludeChildProducts = (
  products: ProductResponse[],
): IdentifiableBaseProduct[] =>
  products.filter(
    (product: ProductResponse): product is IdentifiableBaseProduct =>
      !product?.relationships?.parent,
  );

export const createEmptyOptionDict = (
  variations: CatalogsProductVariation[],
): OptionDict =>
  variations.reduce((acc, c) => ({ ...acc, [c.id]: undefined }), {});
