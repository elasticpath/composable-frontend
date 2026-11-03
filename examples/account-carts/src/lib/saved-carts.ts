import { createHash } from "node:crypto"
import { byMostRecentlyUpdated, chooseActiveCart } from "./active-cart"
import type { CartsPort, ListedCart } from "./cart-service"

export type CartHandle = string & { readonly __brand: "CartHandle" }

export type SavedCart = {
  handle: CartHandle
  name: string
  itemCount: number
  total: string | undefined
  expiresAt: string | undefined
}

export const UNNAMED_CART = "Unnamed cart"

export function cartHandle(cartId: string): CartHandle {
  return createHash("sha256")
    .update(cartId)
    .digest("base64url")
    .slice(0, 22) as CartHandle
}

export function toCartHandle(received: string): CartHandle {
  return received as CartHandle
}

export function resolveCartHandle(
  carts: readonly { id: string }[],
  handle: CartHandle,
): string | undefined {
  return carts.find((cart) => cartHandle(cart.id) === handle)?.id
}

export function savedCartsOf(
  carts: readonly ListedCart[],
  cookieCartId: string | undefined,
): ListedCart[] {
  const active = chooseActiveCart({ cookieCartId, carts })
  const activeCartId = active.kind === "existing" ? active.cartId : undefined

  return carts
    .filter((cart) => !cart.isQuote && cart.id !== activeCartId)
    .sort(byMostRecentlyUpdated)
}

const MAX_CONCURRENT_CART_READS = 5

async function mapWithLimit<T, R>(
  items: readonly T[],
  limit: number,
  work: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await work(items[index]!)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  )

  return results
}

export async function listSavedCarts(
  port: CartsPort,
  cookieCartId: string | undefined,
): Promise<SavedCart[]> {
  const saved = savedCartsOf(await port.listCarts(), cookieCartId)

  return mapWithLimit(saved, MAX_CONCURRENT_CART_READS, async (cart) => {
    const view = await port.readCart(cart.id)

    return {
      handle: cartHandle(cart.id),
      name: cart.name ?? UNNAMED_CART,
      itemCount: view.itemCount,
      total: view.total,
      expiresAt: cart.expiresAt,
    }
  })
}
