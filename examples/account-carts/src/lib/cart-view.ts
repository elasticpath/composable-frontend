import type { CartLine, CartView, ListedCart } from "./cart-service"

type PriceTag = { formatted?: string }

type IncludedItem = {
  id?: string
  type?: string
  name?: string
  quantity?: number
  meta?: {
    display_price?: { with_tax?: { value?: PriceTag } }
  }
}

type CartResponseLike = {
  data: {
    id?: string
    meta?: { display_price?: { with_tax?: PriceTag } }
  }
  included?: { items?: readonly IncludedItem[] }
}

type ListedCartResponse = {
  id?: string
  name?: string
  is_quote?: boolean
  meta?: { timestamps?: { updated_at?: string; expires_at?: string } }
}

function toLine(item: IncludedItem): CartLine | null {
  if (!item.id) return null

  return {
    id: item.id,
    name: item.name ?? "Unnamed item",
    quantity: item.quantity ?? 0,
    lineTotal: item.meta?.display_price?.with_tax?.value?.formatted,
  }
}

export function toCartView(response: CartResponseLike): CartView {
  const lines = (response.included?.items ?? [])
    .map(toLine)
    .filter((line): line is CartLine => line !== null)

  return {
    lines,
    itemCount: lines.reduce((count, line) => count + line.quantity, 0),
    total: response.data.meta?.display_price?.with_tax?.formatted,
  }
}

export function toListedCart(cart: ListedCartResponse): ListedCart | null {
  if (!cart.id) return null

  return {
    id: cart.id,
    name: cart.name,
    updatedAt: cart.meta?.timestamps?.updated_at,
    expiresAt: cart.meta?.timestamps?.expires_at,
    isQuote: cart.is_quote === true,
  }
}
