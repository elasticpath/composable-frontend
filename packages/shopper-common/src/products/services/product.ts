import type {
  Moltin as EPCCClient,
  ProductResponse,
  ShopperCatalogResource,
  File,
} from "@moltin/sdk"
import { Moltin as EpccClient } from "@moltin/sdk"
import { BundleConfigurationSelectedOptions, BundleProduct } from "../"

export async function getProductById(
  productId: string,
  client: EPCCClient,
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
  client: EPCCClient,
): Promise<ShopperCatalogResource<File[]>> {
  return client.Files.Filter({ in: { id: ids } }).All()
}

export async function configureBundle(
  productId: string,
  selectedOptions: BundleConfigurationSelectedOptions,
  client: EpccClient,
): Promise<BundleProduct["response"]> {
  const response = await client.ShopperCatalog.Products.Configure({
    productId,
    selectedOptions,
  })

  return response.data
}
