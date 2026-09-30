import {
  Client,
  getAllFiles,
  getByContextAllRelatedProducts,
} from "@epcc-sdk/sdks-shopper"
import { connectProductsWithMainImages } from "./connect-products-with-main-images"
import { ProductResponseWithImage } from "./types/product-types"

/**
 * The one Custom Relationship the product page reads. A store-shape assumption,
 * declared in the README, not configuration: the product document does advertise its
 * relationships under `relationships.custom_relationships.links`, but that map rarely
 * agrees with what this endpoint returns — it names slugs that come back empty and
 * omits slugs that have products — so walking it spends requests finding nothing.
 * The slug is the one the store holds, `CRP_` prefix included. A slug the store does
 * not define answers 200 with no products, so "missing" and "empty" look the same.
 */
export const RELATED_PRODUCTS_SLUG = "CRP_you-may-also-like"

/**
 * The shopper API gives a relationship no display name, so the heading is
 * storefront copy rather than something read from the store.
 */
export const RELATED_PRODUCTS_HEADING = "You may also like"

// A product page is not a browse page: show a strip, not a paginated list.
const MAX_RELATED_PRODUCTS = 4

interface FetchRelatedProductsOptions {
  lang?: string
  currencyCode?: string
}

/**
 * The products the shopper's catalog relates to `productId` through
 * `RELATED_PRODUCTS_SLUG`, in relationship order, with main images attached. Empty
 * when the product has no such relationship or it is empty — and also when either
 * request fails, see `hiddenOnThrow`.
 */
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

  // The response type declares `included.main_images`, but the request takes no
  // `include`, so the images come from the typed files request the product page
  // already makes for bundle components rather than a cast past the types.
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

/**
 * The one swallow, on purpose, and only around the requests: a product page is not
 * worth failing over a strip of related products, so a request that throws renders
 * as none and the section hides. Code between the requests stays outside it, so a
 * bug there still fails loudly. Remove it while changing this file — it hides real
 * request bugs too.
 */
async function hiddenOnThrow<T>(request: Promise<T>): Promise<T | undefined> {
  try {
    return await request
  } catch {
    return undefined
  }
}
