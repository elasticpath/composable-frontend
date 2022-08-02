import { HTMLChakraProps } from "@chakra-ui/react";
import type {
  File,
  ProductResponse,
  CatalogsProductVariation,
  ShopperCatalogResource,
} from "@moltin/sdk";
import { createContext } from "react";
import type {
  IdentifiableBaseProduct,
  OptionDict,
  ProductContext,
} from "./product-types";
import { ProductImageObject, ProductResponseWithImage } from "./product-types";

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
      supportedMimeTypes.some((type) => fileEntry.mime_type === type)
  );
}

export function getProductOtherImageUrls(
  productResp: ShopperCatalogResource<ProductResponse>
): File[] {
  const files = productResp?.included?.files;
  return files
    ? processImageFiles(files, productResp?.included?.main_images?.[0].id)
    : [];
}

export function getProductMainImage(
  productResp: ShopperCatalogResource<ProductResponse>
): File | null {
  return productResp?.included?.main_images?.[0] || null;
}

export const changingSkuStyle: HTMLChakraProps<"div"> = {
  opacity: "20%",
  cursor: "default",
};

// Using existance of parent relationship property to filter because only child products seem to have this property.
export const filterBaseProducts = (
  products: ProductResponse[]
): IdentifiableBaseProduct[] =>
  products.filter(
    (product: ProductResponse): product is IdentifiableBaseProduct =>
      product.attributes.base_product
  );

// Using existance of parent relationship property to filter because only child products seem to have this property.
export const excludeChildProducts = (
  products: ProductResponse[]
): IdentifiableBaseProduct[] =>
  products.filter(
    (product: ProductResponse): product is IdentifiableBaseProduct =>
      !product?.relationships?.parent
  );

export function findBaseProductSlug(
  product: ProductResponse,
  baseProducts: IdentifiableBaseProduct[]
): string {
  const result = baseProducts.find(
    (baseProduct) => baseProduct.id === product.attributes.base_product_id
  );
  if (!result) {
    throw new Error("Failed to find base product slug.");
  }
  return result.attributes.slug;
}

export const createEmptyOptionDict = (
  variations: CatalogsProductVariation[]
): OptionDict =>
  variations.reduce((acc, c) => ({ ...acc, [c.id]: undefined }), {});

export const productContext = createContext<ProductContext | null>(null);

export const connectProductsWithMainImages = (
  products: ProductResponse[],
  images: File[]
): ProductResponseWithImage[] => {
  // Object with image id as a key and File data as a value
  let imagesObject: ProductImageObject = {};
  images.forEach((image) => {
    imagesObject[image.id] = image;
  });

  const productList: ProductResponseWithImage[] = [...products];
  productList.forEach((product) => {
    if (
      product.relationships.main_image?.data &&
      imagesObject[product.relationships.main_image.data?.id]
    ) {
      product.main_image =
        imagesObject[product.relationships.main_image.data?.id];
    }
  });
  return productList;
};
