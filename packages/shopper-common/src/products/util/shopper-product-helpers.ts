import type { ShopperCatalogResource, Moltin as EPCCClient } from "@moltin/sdk"
import { sortAlphabetically } from "./sort-alphabetically"
import { ProductResponse } from "@moltin/sdk"
import {
  BaseProduct,
  BaseProductResponse,
  BundleProductResponse,
  ChildProduct,
  ChildProductResponse,
  ShopperProduct,
  SimpleProduct,
  SimpleProductResponse,
  BundleProduct,
} from "../"
import {
  getProductMainImage,
  getProductOtherImageUrls,
} from "./product-image-helpers"
import { getFilesByIds, getProductById } from "../services/product"

export async function createShopperBundleProduct(
  productResource: ShopperCatalogResource<BundleProductResponse>,
  client: EPCCClient,
): Promise<BundleProduct> {
  const componentProducts = productResource.included?.component_products

  if (!componentProducts) {
    throw new Error("component_products where unexpectedly undefined")
  }
  const mainImageIds = componentProducts
    .map((c) => c.relationships?.main_image?.data?.id)
    .filter(isString)
  const { data: mainProductComponentImages } = await getFilesByIds(
    mainImageIds,
    client,
  )

  return {
    kind: "bundle-product",
    response: productResource.data,
    main_image: getProductMainImage(productResource.included?.main_images),
    otherImages: getProductOtherImageUrls(
      productResource.included?.files,
      productResource.included?.main_images?.[0],
    ),
    componentProductResponses: componentProducts,
    componentProductImages: mainProductComponentImages,
  }
}

function isString(x: any): x is string {
  return typeof x === "string"
}

export function createShopperSimpleProduct(
  productResource: ShopperCatalogResource<SimpleProductResponse>,
): SimpleProduct {
  return {
    kind: "simple-product",
    response: productResource.data,
    main_image: getProductMainImage(productResource.included?.main_images),
    otherImages: getProductOtherImageUrls(
      productResource.included?.files,
      productResource.included?.main_images?.[0],
    ),
  }
}

export async function createShopperChildProduct(
  productResources: ShopperCatalogResource<ChildProductResponse>,
  client: EPCCClient,
): Promise<ChildProduct> {
  const baseProductId = productResources.data.attributes.base_product_id
  const baseProduct = await getProductById(baseProductId, client)

  if (!baseProduct) {
    throw Error(
      `Unable to retrieve child props, failed to get the base product for ${baseProductId}`,
    )
  }

  const {
    data: {
      meta: { variation_matrix, variations },
    },
  } = baseProduct

  if (!variations || !variation_matrix) {
    throw Error(
      `Unable to retrieve child props, failed to get the variations or variation_matrix from base product for ${baseProductId}`,
    )
  }

  return {
    kind: "child-product",
    response: productResources.data,
    baseProduct: baseProduct.data,
    main_image: getProductMainImage(productResources.included?.main_images),
    otherImages: getProductOtherImageUrls(
      productResources.included?.files,
      productResources.included?.main_images?.[0],
    ),
    variationsMatrix: variation_matrix,
    variations: variations.sort(sortAlphabetically),
  }
}

export function createShopperBaseProduct(
  productResource: ShopperCatalogResource<BaseProductResponse>,
): BaseProduct {
  const {
    data: {
      meta: { variations, variation_matrix },
      attributes: { slug },
    },
  } = productResource

  if (!variations || !variation_matrix) {
    throw Error(
      `Unable to retrieve base product props, failed to get the variations or variation_matrix from base product for ${slug}`,
    )
  }

  return {
    kind: "base-product",
    response: productResource.data,
    main_image: getProductMainImage(productResource.included?.main_images),
    otherImages: getProductOtherImageUrls(
      productResource.included?.files,
      productResource.included?.main_images?.[0],
    ),
    variationsMatrix: variation_matrix,
    variations: variations.sort(sortAlphabetically),
  }
}

export function isBundleProduct(
  productResponse: ShopperCatalogResource<ProductResponse>,
): boolean {
  return "components" in productResponse.data.attributes
}

export function isVariationProductChild(
  product: ShopperCatalogResource<ProductResponse>,
): boolean {
  return "base_product_id" in product.data.attributes
}

export function isVariationProductBase(
  product: ShopperCatalogResource<ProductResponse>,
): boolean {
  return product.data.attributes.base_product
}

export async function parseProductResponse(
  product: ShopperCatalogResource<ProductResponse>,
  client: EPCCClient,
): Promise<ShopperProduct> {
  if (isBundleProduct(product)) {
    return createShopperBundleProduct(
      product as ShopperCatalogResource<BundleProductResponse>,
      client,
    )
  }

  // Handle Variation products
  if (isVariationProductBase(product)) {
    return createShopperBaseProduct(
      product as ShopperCatalogResource<BaseProductResponse>,
    )
  }

  if (isVariationProductChild(product)) {
    return createShopperChildProduct(
      product as ShopperCatalogResource<ChildProductResponse>,
      client,
    )
  }

  return createShopperSimpleProduct(
    product as ShopperCatalogResource<SimpleProductResponse>,
  )
}
