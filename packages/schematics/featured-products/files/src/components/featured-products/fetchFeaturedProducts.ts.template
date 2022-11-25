// Fetching the first 4 products of a featured-nodes to display in the featured-products component
import { getProductsByNode } from "../../services/hierarchy";
import { connectProductsWithMainImages } from "../../lib/product-util";

export const fetchFeaturedProducts = async (NODE_ID: string) => {
  const { data: nodeProductsResponse, included: nodeProductsIncluded } =
    await getProductsByNode(NODE_ID);

  return nodeProductsIncluded?.main_images
    ? connectProductsWithMainImages(
        nodeProductsResponse.slice(0, 4), // Only need the first 4 products to feature
        nodeProductsIncluded?.main_images
      )
    : nodeProductsResponse;
};
