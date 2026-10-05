import { createHash } from "node:crypto"
import { byMostRecentlyUpdated, chooseActiveCart } from "./active-cart"
import type { CartsPort, ListedCart } from "./cart-service"

export type SavedCart = {
  handle: string
  name: string
  itemCount: number
  total: string | undefined
  expiresAt: string | undefined
}

export const UNNAMED_CART = "Unnamed cart"

export function cartHandle(cartId: string): string {
  return createHash("sha256").update(cartId).digest("base64url").slice(0, 22)
}

export function resolveCartHandle(
  carts: readonly { id: string }[],
  handle: string,
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

export async function listSavedCarts(
  port: CartsPort,
  cookieCartId: string | undefined,
): Promise<SavedCart[]> {
  const saved = savedCartsOf(await port.listCarts(), cookieCartId)

  return Promise.all(
    saved.map(async (cart) => {
      const view = await port.readCart(cart.id)

      return {
        handle: cartHandle(cart.id),
        name: cart.name ?? UNNAMED_CART,
        itemCount: view.itemCount,
        total: view.total,
        expiresAt: cart.expiresAt,
      }
    }),
  )
}
