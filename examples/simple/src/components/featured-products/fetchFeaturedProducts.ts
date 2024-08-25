import {
  getByContextAllProducts,
  client as sdkClient,
} from "@epcc-sdk/sdks-shopper";

// Fetching the first 4 products of in the catalog to display in the featured-products component
export const fetchFeaturedProducts = async (client: typeof sdkClient) => {
  return await getByContextAllProducts({
    client,
    query: {
      "page[limit]": 4,
      "page[offset]": 0,
    },
  });
};
