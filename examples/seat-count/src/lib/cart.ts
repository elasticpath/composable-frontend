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

function firstErrorDetail(error: unknown): string | null {
  const errors = (error as { errors?: { detail?: string; title?: string }[] })
    ?.errors
  const first = errors?.[0]
  return first?.detail ?? first?.title ?? null
}

async function guestCartId(): Promise<string | { error: string }> {
  const cookieStore = await cookies()
  const existing = cookieStore.get(CART_COOKIE_KEY)?.value
  if (existing) return existing

  const created = await createACart({
    body: { data: { name: "Seat count cart" } },
  })
  const cartId = created.data?.data?.id

  if (created.error || !cartId) {
    return {
      error: `The store did not create a cart${detailSuffix(created.error)}`,
    }
  }

  cookieStore.set({
    name: CART_COOKIE_KEY,
    value: cartId,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return cartId
}

function detailSuffix(error: unknown): string {
  const detail = firstErrorDetail(error)
  return detail ? `: ${detail}` : "."
}

export async function addSeatsToGuestCart(
  productId: string,
  seats: number,
): Promise<{ error: string } | null> {
  const cartId = await guestCartId()
  if (typeof cartId !== "string") return cartId

  const added = await manageCarts({
    path: { cartID: cartId },
    body: { data: { type: "cart_item", id: productId, quantity: seats } },
  })

  if (added.error) {
    return {
      error: `The cart did not accept the seats${detailSuffix(added.error)}`,
    }
  }

  return null
}

export async function readGuestCart(): Promise<GuestCart | null> {
  const cookieStore = await cookies()
  const cartId = cookieStore.get(CART_COOKIE_KEY)?.value
  if (!cartId) return EMPTY_CART

  const [items, cart] = await Promise.all([
    getCartItems({ path: { cartID: cartId } }),
    getACart({ path: { cartID: cartId } }),
  ])

  if (items.response?.status === 404 || cart.response?.status === 404) {
    return EMPTY_CART
  }
  if (items.error || cart.error) return null

  const lines = (items.data?.data ?? []).flatMap((item): CartLine[] => {
    if (!isProductLine(item) || !item.id) return []
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
