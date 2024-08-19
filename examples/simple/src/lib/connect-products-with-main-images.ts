import {
  ProductImageObject,
  ProductResponseWithImage,
} from "./types/product-types";
import { Product } from "@epcc-sdk/sdks-shopper";

export const connectProductsWithMainImages = (
  products: Product[],
  images: any[], // TODO fix file type in new sdk
): ProductResponseWithImage[] => {
  // Object with image id as a key and File data as a value
  let imagesObject: ProductImageObject = {};
  images.forEach((image) => {
    imagesObject[image.id] = image;
  });

  const productList: ProductResponseWithImage[] = [...products];

  productList.forEach((product) => {
    if (
      product.relationships?.main_image?.data?.id &&
      imagesObject[product.relationships.main_image.data?.id]
    ) {
      product.main_image =
        imagesObject[product.relationships.main_image.data?.id];
    }
  });
  return productList;
};
