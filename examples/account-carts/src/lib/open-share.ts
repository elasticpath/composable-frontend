import { chooseActiveCart } from "./active-cart"
import type { CartsPort } from "./cart-service"
import { CartsUnavailableError } from "./carts-port"
import { describeMergeFailure, type MergeFailure } from "./merge-failure"
import type { SharedCart } from "./shared-cart"
import type { ShareEntry } from "./shares"

export const SHARE_UNAVAILABLE_MESSAGE =
  "This link does not work. It may have been revoked, it may have expired, or it may not be a link from this store."

export type ShareSource = {
  lookupShare(token: string): Promise<ShareEntry | null>
  readSharedCart(cartId: string): Promise<SharedCart | null>
}

export type OpenedShare =
  | { status: "available"; cartId: string; cart: SharedCart }
  | { status: "unavailable" }

export type AcceptedShare =
  | { status: "merged"; cartId: string }
  | { status: "already-active"; cartId: string }
  | { status: "failed"; cartId: string; failure: MergeFailure }
  | { status: "unavailable" }

const UNAVAILABLE: OpenedShare = { status: "unavailable" }

export async function openShare(
  source: ShareSource,
  token: string,
): Promise<OpenedShare> {
  const share = await source.lookupShare(token)
  if (!share) return UNAVAILABLE

  const cart = await source.readSharedCart(share.cart_id)
  if (!cart) return UNAVAILABLE

  return { status: "available", cartId: share.cart_id, cart }
}

export async function acceptShare(
  port: CartsPort,
  source: ShareSource,
  { token, cookieCartId }: { token: string; cookieCartId: string | undefined },
): Promise<AcceptedShare> {
  const opened = await openShare(source, token)
  if (opened.status === "unavailable") return opened

  const choice = chooseActiveCart({
    cookieCartId,
    carts: await port.listCarts(),
  })

  if (choice.kind === "existing" && choice.cartId === opened.cartId) {
    return { status: "already-active", cartId: opened.cartId }
  }

  const targetCartId =
    choice.kind === "existing" ? choice.cartId : await port.createCart()

  try {
    await port.mergeCart(targetCartId, opened.cartId)
  } catch (error) {
    if (!(error instanceof CartsUnavailableError)) throw error

    return {
      status: "failed",
      cartId: targetCartId,
      failure: describeMergeFailure({ error, lines: opened.cart.lines }),
    }
  }

  return { status: "merged", cartId: targetCartId }
}
