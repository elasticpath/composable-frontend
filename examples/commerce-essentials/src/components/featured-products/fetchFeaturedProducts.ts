import { getProducts } from "../../services/products";
import { ElasticPath } from "@elasticpath/js-sdk";
import { ProductResponseWithImage } from "../../lib/types/product-types";
import { connectProductsWithMainImages } from "../../lib/connect-products-with-main-images";

// Fetching the first 4 products of in the catalog to display in the featured-products component
export const fetchFeaturedProducts = async (
  client: ElasticPath,
): Promise<ProductResponseWithImage[]> => {
  const { data: productsResponse, included: productsIncluded } =
    await getProducts(client);

  return productsIncluded?.main_images
    ? connectProductsWithMainImages(
        productsResponse.slice(0, 4), // Only need the first 4 products to feature
        productsIncluded?.main_images,
      )
    : productsResponse;
};
