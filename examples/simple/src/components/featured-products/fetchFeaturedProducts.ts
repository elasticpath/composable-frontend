import { ElasticPath } from "@elasticpath/js-sdk";
import { ProductResponseWithImage } from "../../lib/types/product-types";
import { connectProductsWithMainImages } from "../../lib/connect-products-with-main-images";
import {
  getByContextAllProducts,
  GetByContextAllProductsResponse,
} from "@epcc-sdk/sdks-shopper";

// Fetching the first 4 products of in the catalog to display in the featured-products component
export const fetchFeaturedProducts = async (
  client: ElasticPath,
): Promise<GetByContextAllProductsResponse[]> => {
  const productsResponse = await getByContextAllProducts({
    query: {
      "page[limit]": 100,
      "page[offset]": 0,
    },
  });

  if (!productsResponse.data) {
    return [];
  }

  const productData = productsResponse.data;
  const productIncluded = productData.included;

  return productIncluded?.main_images && productData.data
    ? connectProductsWithMainImages(
        productData.data.slice(0, 4), // Only need the first 4 products to feature
        productIncluded.main_images,
      )
    : productsResponse;
};
