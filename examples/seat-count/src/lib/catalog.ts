import "server-only"
import {
  getByContextAllProducts,
  getByContextProduct,
  type Product,
} from "@epcc-sdk/sdks-shopper"
import { configureClient } from "./api-client"
import { selectSeats, type SeatProduct } from "./seat-rules"

configureClient()

const CATALOG_PAGE_LIMIT = 100

export type SeatCatalogProduct = {
  id: string
  name: string
  sku: string
  description: string
  seatProduct: SeatProduct
}

export type ProductLookup =
  | { status: "found"; product: SeatCatalogProduct }
  | { status: "missing" }
  | { status: "failed" }

function toSeatCatalogProduct(product: Product): SeatCatalogProduct | null {
  if (!product.id) return null

  return {
    id: product.id,
    name: product.attributes?.name ?? "Unnamed product",
    sku: product.attributes?.sku ?? "",
    description: product.attributes?.description ?? "",
    seatProduct: {
      attributes: {
        shopper_attributes: product.attributes?.shopper_attributes ?? {},
      },
      meta: { display_price: product.meta?.display_price ?? {} },
    },
  }
}

function sellableBySeat(product: Product): boolean {
  const isStandard = product.meta?.product_types?.includes("standard") ?? false
  return isStandard && selectSeats(product, 1).total !== null
}

export async function fetchSeatProducts(): Promise<
  SeatCatalogProduct[] | null
> {
  const response = await getByContextAllProducts({
    query: { "page[limit]": BigInt(CATALOG_PAGE_LIMIT) },
  })

  if (response.error || !response.data?.data) return null

  return response.data.data
    .filter(sellableBySeat)
    .map(toSeatCatalogProduct)
    .filter((product): product is SeatCatalogProduct => product !== null)
}

export async function fetchSeatProduct(
  productId: string,
): Promise<ProductLookup> {
  const response = await getByContextProduct({
    path: { product_id: productId },
  })

  if (response.response?.status === 404) return { status: "missing" }
  if (response.error || !response.data?.data) return { status: "failed" }

  const product = toSeatCatalogProduct(response.data.data)
  return product ? { status: "found", product } : { status: "missing" }
}
