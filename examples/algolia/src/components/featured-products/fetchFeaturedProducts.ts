// Fetching the first 4 products of in the catalog to display in the featured-products component
import { connectProductsWithMainImages } from "../../lib/product-util";
import {getProducts} from "../../services/products";

export const fetchFeaturedProducts = async () => {
  const { data: productsResponse, included: productsIncluded } =
    await getProducts();

  return productsIncluded?.main_images
    ? connectProductsWithMainImages(
          productsResponse.slice(0, 4), // Only need the first 4 products to feature
          productsIncluded?.main_images
      )
    : productsResponse;
};
