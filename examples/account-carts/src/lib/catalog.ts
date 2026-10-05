import "server-only"

import { createClient, getByContextAllProducts } from "@epcc-sdk/sdks-shopper"
import { getImplicitAccessToken } from "./server-credentials"
import { listableProducts, type ProductSummary } from "./listable-products"

const CATALOG_PAGE_SIZE = 50

export async function fetchListableProducts(): Promise<
  ProductSummary[] | null
> {
  try {
    const headers = {
      Authorization: `Bearer ${await getImplicitAccessToken()}`,
    }

    const response = await getByContextAllProducts({
      client: createClient({
        baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
      }),
      headers,
      query: { "page[limit]": BigInt(CATALOG_PAGE_SIZE) },
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
