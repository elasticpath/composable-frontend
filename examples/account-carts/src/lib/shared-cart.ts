export type SharedLine = {
  id: string
  productId: string | undefined
  name: string
  quantity: number
  lineTotal: string | undefined
}

export type SharedCart = {
  lines: SharedLine[]
  itemCount: number
  total: string | undefined
}

type IncludedItem = {
  id?: string
  product_id?: string
  type?: string
  name?: string
  quantity?: number
  meta?: {
    display_price?: { with_tax?: { value?: { formatted?: string } } }
  }
}

type SharedCartResponse = {
  data: { meta?: { display_price?: { with_tax?: { formatted?: string } } } }
  included?: { items?: readonly IncludedItem[] }
}

function toLine(item: IncludedItem): SharedLine | null {
  if (!item.id) return null

  return {
    id: item.id,
    productId: item.product_id,
    name: item.name ?? "Unnamed item",
    quantity: item.quantity ?? 0,
    lineTotal: item.meta?.display_price?.with_tax?.value?.formatted,
  }
}

export function toSharedCart(response: SharedCartResponse): SharedCart {
  const lines = (response.included?.items ?? [])
    .map(toLine)
    .filter((line): line is SharedLine => line !== null)

  return {
    lines,
    itemCount: lines.reduce((count, line) => count + line.quantity, 0),
    total: response.data.meta?.display_price?.with_tax?.formatted,
  }
}
