import { File, ProductResponse } from "@elasticpath/js-sdk";
import {
  ProductImageObject,
  ProductResponseWithImage,
} from "./types/product-types";

export const connectProductsWithMainImages = (
  products: ProductResponse[],
  images: File[],
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
