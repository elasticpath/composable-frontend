import { parseCartName } from "./cart-name"
import type { CartsPort } from "./cart-service"
import { chooseDeletion } from "./delete-cart"
import { resolveCartHandle, type CartHandle } from "./saved-carts"

export type RenameResult =
  | { status: "renamed"; name: string }
  | { status: "invalid-name"; problem: string }
  | { status: "not-found" }

export type DeleteResult =
  | { status: "deleted"; activeCartId: string | undefined }
  | { status: "not-found" }

export type ResumeResult =
  | { status: "resumed"; cartId: string }
  | { status: "not-found" }

async function shoppableCarts(port: CartsPort) {
  const carts = await port.listCarts()

  return { carts, shoppable: carts.filter((cart) => !cart.isQuote) }
}

export async function renameSavedCart(
  port: CartsPort,
  handle: CartHandle,
  requestedName: string,
): Promise<RenameResult> {
  const name = parseCartName(requestedName)
  if (!name.ok) {
    return { status: "invalid-name", problem: name.problem }
  }

  const { shoppable } = await shoppableCarts(port)
  const cartId = resolveCartHandle(shoppable, handle)
  if (!cartId) {
    return { status: "not-found" }
  }

  await port.renameCart(cartId, name.name)

  return { status: "renamed", name: name.name }
}

export async function deleteSavedCart(
  port: CartsPort,
  handle: CartHandle,
): Promise<DeleteResult> {
  const { carts, shoppable } = await shoppableCarts(port)
  const cartId = resolveCartHandle(shoppable, handle)
  if (!cartId) {
    return { status: "not-found" }
  }

  const plan = chooseDeletion({ carts, cartId })

  if (plan.disassociateFirst) {
    await port.disassociateCart(cartId)
  }
  await port.deleteCart(cartId)

  const activeCartId = plan.createReplacement
    ? await port.createCart()
    : undefined

  return { status: "deleted", activeCartId }
}

export async function resumeSavedCart(
  port: CartsPort,
  handle: CartHandle,
): Promise<ResumeResult> {
  const { shoppable } = await shoppableCarts(port)
  const cartId = resolveCartHandle(shoppable, handle)

  return cartId ? { status: "resumed", cartId } : { status: "not-found" }
}
