import "server-only"

import { getByContextAllProducts } from "@epcc-sdk/sdks-shopper"
import { getImplicitAccessToken } from "./server-credentials"
import { listableProducts, type ProductSummary } from "./listable-products"
import { createStoreClient } from "./store-client"

const CATALOG_PAGE_SIZE = 50

export async function fetchListableProducts(): Promise<
  ProductSummary[] | null
> {
  try {
    const headers = {
      Authorization: `Bearer ${await getImplicitAccessToken()}`,
    }

    const response = await getByContextAllProducts({
      client: createStoreClient(),
      headers,
      query: { "page[limit]": CATALOG_PAGE_SIZE },
    })

    if (response.error || !response.data?.data) {
      return null
    }

    return listableProducts(response.data.data)
  } catch (error) {
    console.error(error)
    return null
  }
}
