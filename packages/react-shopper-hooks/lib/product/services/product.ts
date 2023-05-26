import type {
  Moltin as EPCCClient,
  ProductResponse,
  ShopperCatalogResource,
} from "@moltin/sdk"

export async function getProductById(
  productId: string,
  client: EPCCClient
): Promise<ShopperCatalogResource<ProductResponse>> {
  return client.ShopperCatalog.Products.With([
    "main_image",
    "files",
    "component_products",
  ]).Get({
    productId,
  })
}
