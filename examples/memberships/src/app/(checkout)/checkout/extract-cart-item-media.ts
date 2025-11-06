import {
  CartItemResponse,
  ElasticPathFile,
  Product,
} from "@epcc-sdk/sdks-shopper";

export function extractCartItemMedia({
  items,
  products,
  mainImages,
}: {
  items: Array<CartItemResponse>;
  products: Array<Product>;
  mainImages: Array<ElasticPathFile>;
}) {
  return (
    items.reduce(
      (acc, curr) => {
        const product = products.find(
          (product) => "product_id" in curr && product.id === curr.product_id,
        );

        if (!product) {
          return acc;
        }

        const mainImageId = product.relationships?.main_image?.data?.id;
        const mainImage = mainImages.find((file) => file.id === mainImageId);

        return {
          ...acc,
          ...(mainImage && { [product.id!]: mainImage }),
        };
      },
      {} as Record<string, ElasticPathFile>,
    ) ?? {}
  );
}
