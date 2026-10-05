import "server-only"
import { cookies } from "next/headers"
import {
  createACart,
  getACart,
  getCartItems,
  manageCarts,
  type CartItemObject,
  type CartItemsResponse,
} from "@epcc-sdk/sdks-shopper"
import { CART_COOKIE_KEY } from "../app/constants"
import { configureClient } from "./api-client"

configureClient()

export type CartLine = {
  id: string
  name: string
  sku: string
  seats: number
  unitPrice: string
  lineTotal: string
}

export type GuestCart = {
  lines: CartLine[]
  total: string | null
}

const EMPTY_CART: GuestCart = { lines: [], total: null }

type CartItemsEntry = NonNullable<CartItemsResponse["data"]>[number]

function isProductLine(item: CartItemsEntry): item is CartItemObject {
  return "type" in item && item.type === "cart_item"
}

function failureMessage(lead: string, error: unknown): string {
  const errors = (error as { errors?: { detail?: string; title?: string }[] })
    ?.errors
  const detail = errors?.[0]?.detail ?? errors?.[0]?.title
  return detail ? `${lead}: ${detail}` : `${lead}.`
}

async function storedCartId(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE_KEY)?.value
}

async function guestCartId(): Promise<{ cartId: string } | { error: string }> {
  const existing = await storedCartId()
  if (existing) return { cartId: existing }

  const created = await createACart({
    body: { data: { name: "Seat count cart" } },
  })
  const cartId = created.data?.data?.id

  if (created.error || !cartId) {
    return {
      error: failureMessage("The store did not create a cart", created.error),
    }
  }

  const cookieStore = await cookies()
  cookieStore.set({
    name: CART_COOKIE_KEY,
    value: cartId,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return { cartId }
}

async function productLines(cartId: string): Promise<CartItemObject[] | null> {
  const items = await getCartItems({ path: { cartID: cartId } })

  if (items.response?.status === 404) return []
  if (items.error) return null

  return (items.data?.data ?? []).filter(isProductLine)
}

export async function seatsInGuestCart(
  productId: string,
): Promise<number | null> {
  const cartId = await storedCartId()
  if (!cartId) return 0

  const lines = await productLines(cartId)
  if (lines === null) return null

  return lines
    .filter((line) => line.product_id === productId)
    .reduce((seats, line) => seats + (line.quantity ?? 0), 0)
}

export async function addSeatsToGuestCart(
  productId: string,
  seats: number,
): Promise<{ error: string } | null> {
  const cart = await guestCartId()
  if ("error" in cart) return cart

  const added = await manageCarts({
    path: { cartID: cart.cartId },
    body: { data: { type: "cart_item", id: productId, quantity: seats } },
  })

  if (added.error) {
    return {
      error: failureMessage("The cart did not accept the seats", added.error),
    }
  }

  return null
}

export async function readGuestCart(): Promise<GuestCart | null> {
  const cartId = await storedCartId()
  if (!cartId) return EMPTY_CART

  const [items, cart] = await Promise.all([
    productLines(cartId),
    getACart({ path: { cartID: cartId } }),
  ])

  if (items === null) return null
  if (cart.response?.status === 404) return EMPTY_CART
  if (cart.error) return null

  const lines = items.flatMap((item): CartLine[] => {
    if (!item.id) return []
    const price = item.meta?.display_price?.without_tax

    return [
      {
        id: item.id,
        name: item.name ?? "Unnamed product",
        sku: item.sku ?? "",
        seats: item.quantity ?? 0,
        unitPrice: price?.unit?.formatted ?? "",
        lineTotal: price?.value?.formatted ?? "",
      },
    ]
  })

  return {
    lines,
    total: cart.data?.data?.meta?.display_price?.without_tax?.formatted ?? null,
  }
}
