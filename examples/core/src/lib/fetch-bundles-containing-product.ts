import {
  Client,
  getByContextAllProducts,
  postMultiSearch,
} from "@epcc-sdk/sdks-shopper"
import { connectProductsWithMainImages } from "./connect-products-with-main-images"
import { ProductResponseWithImage } from "./types/product-types"

/**
 * Catalog search projects every bundle's component options onto the bundle's own
 * document, so "which bundles contain this product" is a single filter on a stock,
 * shopper-readable field — no index registration and no admin credentials. The index
 * also resolves publish state and catalog rules, so the shopper sees only the bundles
 * published into their catalog, which is usually fewer than an administrator sees.
 */
export const COMPONENT_OPTION_ID_FIELD = "meta.search.component_options.id"

// A product page is not a browse page: show a strip of bundles, not a paginated list.
const MAX_BUNDLES = 4

interface FetchBundlesContainingProductOptions {
  lang?: string
  currencyCode?: string
}

/**
 * The published bundles that carry `productId` as one of their component options.
 * Empty when the product is in no published bundle — and also when the lookup fails,
 * see below.
 */
export async function fetchBundlesContainingProduct(
  client: Client,
  productId: string,
  { lang, currencyCode }: FetchBundlesContainingProductOptions = {},
): Promise<ProductResponseWithImage[]> {
  try {
    const searchResponse = await postMultiSearch({
      client,
      body: {
        searches: [
          {
            type: "search",
            q: "*",
            filter_by: `${COMPONENT_OPTION_ID_FIELD}:=${productId}`,
            per_page: MAX_BUNDLES,
          },
        ],
      },
      headers: {
        "Accept-Language": lang,
      },
    })

    if (searchResponse.error) {
      // Swallowed on purpose. A `filter_by` naming a field the store has not indexed
      // answers HTTP 400 rather than an empty result set, so on a store without the
      // component fields this would otherwise break every product page. "We could not
      // find out" and "there are none" both render as no bundles, and the section hides.
      return []
    }

    const bundleIds = [
      ...new Set(
        (searchResponse.data?.results?.[0]?.hits ?? [])
          .map((hit) => hit.document?.id)
          .filter((id): id is string => Boolean(id)),
      ),
    ]

    if (bundleIds.length === 0) {
      return []
    }

    // The search hit is a whole product document, but `MultiSearchResponse` types its
    // `attributes` and `meta` as arbitrary objects and has no `included`, so reading
    // names, prices and images off it means casting past our own generated types.
    // One more typed request by id costs a server-side round trip and keeps the types.
    const productsResponse = await getByContextAllProducts({
      client,
      query: {
        filter: `in(id,${bundleIds.join(",")})`,
        include: ["main_image"],
      },
      headers: {
        "Accept-Language": lang,
        "X-Moltin-Currency": currencyCode,
      },
    })

    const bundles = productsResponse.data?.data

    if (!bundles) {
      return []
    }

    const mainImages = productsResponse.data?.included?.main_images

    return mainImages
      ? connectProductsWithMainImages(bundles, mainImages)
      : bundles
  } catch {
    // Same decision for a thrown request: a product page is not worth failing over a
    // strip of related bundles, so anything that stops us answering renders as none.
    return []
  }
}
