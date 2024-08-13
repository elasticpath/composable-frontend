import type {
  ElasticPath,
  ProductResponse,
  ShopperCatalogResource,
  File,
} from "@elasticpath/js-sdk"
import { BundleConfigurationSelectedOptions, BundleProduct } from "../"

export async function getProductById(
  productId: string,
  client: ElasticPath,
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
  client: ElasticPath,
): Promise<ShopperCatalogResource<File[]>> {
  return client.Files.Filter({ in: { id: ids } }).All()
}

export async function configureBundle(
  productId: string,
  selectedOptions: BundleConfigurationSelectedOptions,
  client: ElasticPath,
): Promise<BundleProduct["response"]> {
  const response = await client.ShopperCatalog.Products.Configure({
    productId,
    selectedOptions,
  })

  return response.data
}
