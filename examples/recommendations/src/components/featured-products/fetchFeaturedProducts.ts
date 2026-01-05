import { ProductResponseWithImage } from "../../lib/types/product-types";
import { connectProductsWithMainImages } from "../../lib/connect-products-with-main-images";
import { Client, getByContextAllProducts } from "@epcc-sdk/sdks-shopper";

// Fetching the first 4 products of in the catalog to display in the featured-products component
export const fetchFeaturedProducts = async (
  client: Client,
): Promise<ProductResponseWithImage[]> => {
  const { data: productsResponse } = await getByContextAllProducts({
    client,
    query: {
      include: ["main_image"],
    },
  });

  if (!productsResponse?.data) {
    return [];
  }

  return productsResponse.included?.main_images
    ? connectProductsWithMainImages(
        productsResponse.data.slice(0, 4) ?? [], // Only need the first 4 products to feature
        productsResponse.included.main_images,
      )
    : productsResponse.data;
};
