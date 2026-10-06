export type ProductSummary = {
  id: string
  name: string
  sku: string
  price: string
}

type CatalogProduct = {
  id?: string
  attributes?: { name?: string; sku?: string }
  meta?: {
    product_types?: readonly string[]
    display_price?: {
      with_tax?: { formatted?: string }
      without_tax?: { formatted?: string }
    }
  }
}

export const DEFAULT_PRODUCT_LIMIT = 12

function toSummary(product: CatalogProduct): ProductSummary | null {
  const price =
    product.meta?.display_price?.with_tax?.formatted ??
    product.meta?.display_price?.without_tax?.formatted

  if (!product.id || !price) return null
  if (!product.meta?.product_types?.includes("standard")) return null

  return {
    id: product.id,
    name: product.attributes?.name ?? "Unnamed product",
    sku: product.attributes?.sku ?? "",
    price,
  }
}

export function listableProducts(
  products: readonly CatalogProduct[],
  limit: number = DEFAULT_PRODUCT_LIMIT,
): ProductSummary[] {
  return products
    .map(toSummary)
    .filter((product): product is ProductSummary => product !== null)
    .slice(0, limit)
}
