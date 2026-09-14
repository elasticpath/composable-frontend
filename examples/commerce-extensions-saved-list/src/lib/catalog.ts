import {
  getByContextAllProducts,
  getByContextProduct,
} from "@epcc-sdk/sdks-shopper"
import { configureClient } from "./api-client"

configureClient()

export type ProductSummary = {
  id: string
  name: string
  sku: string
}

function toSummary(product: {
  id?: string
  attributes?: { name?: string; sku?: string }
}): ProductSummary | null {
  if (!product.id) return null

  return {
    id: product.id,
    name: product.attributes?.name ?? "Unnamed product",
    sku: product.attributes?.sku ?? "",
  }
}

/**
 * The products a shopper can save. Returns `null` when the catalog cannot be
 * read at all, which the caller reports as a store setup problem rather than
 * showing an empty grid.
 */
export async function fetchPublishedProducts(): Promise<
  ProductSummary[] | null
> {
  const response = await getByContextAllProducts({
    query: { "page[limit]": BigInt(12) },
  })

  if (!response.data?.data) {
    return null
  }

  return response.data.data
    .map(toSummary)
    .filter((product): product is ProductSummary => product !== null)
}

/**
 * Looks up the products on a saved list.
 *
 * A saved entry outlives the product it points at, so a product that has since
 * been unpublished or deleted is skipped rather than failing the whole page.
 */
export async function fetchProductsByIds(
  ids: string[],
): Promise<Map<string, ProductSummary>> {
  const found = await Promise.all(
    ids.map(async (id) => {
      try {
        const response = await getByContextProduct({ path: { product_id: id } })
        return response.data?.data ? toSummary(response.data.data) : null
      } catch {
        return null
      }
    }),
  )

  return new Map(
    found
      .filter((product): product is ProductSummary => product !== null)
      .map((product) => [product.id, product]),
  )
}
