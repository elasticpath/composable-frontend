import {
  Client,
  getAllFiles,
  getByContextAllRelatedProducts,
} from "@epcc-sdk/sdks-shopper"
import { connectProductsWithMainImages } from "./connect-products-with-main-images"
import { ProductResponseWithImage } from "./types/product-types"

export const RELATED_PRODUCTS_SLUG = "CRP_you-may-also-like"

export const RELATED_PRODUCTS_HEADING = "You may also like"

const MAX_RELATED_PRODUCTS = 4

interface FetchRelatedProductsOptions {
  lang?: string
  currencyCode?: string
}

export async function fetchRelatedProducts(
  client: Client,
  productId: string,
  { lang, currencyCode }: FetchRelatedProductsOptions = {},
): Promise<ProductResponseWithImage[]> {
  const relatedResponse = await hiddenOnThrow(
    getByContextAllRelatedProducts({
      client,
      path: {
        product_id: productId,
        custom_relationship_slug: RELATED_PRODUCTS_SLUG,
      },
      query: {
        "page[limit]": BigInt(MAX_RELATED_PRODUCTS),
      },
      headers: {
        "Accept-Language": lang,
        "X-Moltin-Currency": currencyCode,
      },
    }),
  )

  const products = relatedResponse?.data?.data ?? []

  if (!relatedResponse || relatedResponse.error || products.length === 0) {
    return []
  }

  const mainImageIds = [
    ...new Set(
      products
        .map((product) => product.relationships?.main_image?.data?.id)
        .filter((id): id is string => Boolean(id)),
    ),
  ]

  if (mainImageIds.length === 0) {
    return products
  }

  const filesResponse = await hiddenOnThrow(
    getAllFiles({
      client,
      query: {
        filter: `in(id,${mainImageIds.join(",")})`,
      },
    }),
  )

  if (!filesResponse || filesResponse.error) {
    return []
  }

  return connectProductsWithMainImages(products, filesResponse.data?.data ?? [])
}

async function hiddenOnThrow<T>(request: Promise<T>): Promise<T | undefined> {
  try {
    return await request
  } catch {
    return undefined
  }
}
