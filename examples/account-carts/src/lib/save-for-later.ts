import { chooseActiveCart } from "./active-cart"
import { parseCartName } from "./cart-name"
import type { CartsPort } from "./cart-service"

export type SaveForLaterResult =
  | { status: "saved"; name: string; activeCartId: string }
  | { status: "nothing-to-save" }
  | { status: "invalid-name"; problem: string }

export async function saveForLater(
  port: CartsPort,
  cookieCartId: string | undefined,
  requestedName: string,
): Promise<SaveForLaterResult> {
  const name = parseCartName(requestedName)
  if (!name.ok) {
    return { status: "invalid-name", problem: name.problem }
  }

  const choice = chooseActiveCart({
    cookieCartId,
    carts: await port.listCarts(),
  })
  if (choice.kind === "create") {
    return { status: "nothing-to-save" }
  }

  const cart = await port.readCart(choice.cartId)
  if (cart.lines.length === 0) {
    return { status: "nothing-to-save" }
  }

  await port.renameCart(choice.cartId, name.name)
  const activeCartId = await port.createCart()

  return { status: "saved", name: name.name, activeCartId }
}
