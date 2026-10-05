import type { CartsPort } from "./cart-service"
import { UNNAMED_CART, resolveCartHandle, savedCartsOf } from "./saved-carts"
import {
  createShare,
  listShares,
  type ShareEntry,
  type ShareStore,
} from "./shares"

export type ShareLink = {
  id: string
  token: string
  cartName: string | undefined
  sharedAt: string
}

export type ShareCartResult =
  | { status: "shared"; share: ShareEntry }
  | { status: "not-found" }

export async function shareSavedCart(
  port: CartsPort,
  store: ShareStore,
  {
    accountId,
    cookieCartId,
    handle,
    now,
    newToken,
  }: {
    accountId: string
    cookieCartId: string | undefined
    handle: string
    now?: Date
    newToken?: () => string
  },
): Promise<ShareCartResult> {
  const saved = savedCartsOf(await port.listCarts(), cookieCartId)
  const cartId = resolveCartHandle(saved, handle)

  if (!cartId) {
    return { status: "not-found" }
  }

  const share = await createShare(store, { accountId, cartId, now, newToken })

  return { status: "shared", share }
}

export async function listShareLinks(
  port: CartsPort,
  store: ShareStore,
  accountId: string,
): Promise<ShareLink[]> {
  const [shares, carts] = await Promise.all([
    listShares(store, accountId),
    port.listCarts(),
  ])

  return shares.map((share) => {
    const cart = carts.find((candidate) => candidate.id === share.cart_id)

    return {
      id: share.id,
      token: share.share_token,
      cartName: cart ? (cart.name ?? UNNAMED_CART) : undefined,
      sharedAt: share.shared_at,
    }
  })
}
