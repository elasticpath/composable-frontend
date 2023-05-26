import type {
  Moltin as EPCCClient,
  ProductResponse,
  ShopperCatalogResource,
  File,
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

export async function getFilesByIds(
  ids: string[],
  client: EPCCClient
): Promise<ShopperCatalogResource<File[]>> {
  return client.Files.Filter({ in: { id: ids } }).All()
}
