import { chooseActiveCart, type CartCandidate } from "./active-cart"

export type CartLine = {
  id: string
  name: string
  quantity: number
  lineTotal: string | undefined
}

export type CartView = {
  lines: CartLine[]
  itemCount: number
  total: string | undefined
}

export type CartsPort = {
  listCarts(): Promise<CartCandidate[]>
  createCart(): Promise<string>
  addProduct(cartId: string, productId: string): Promise<void>
  readCart(cartId: string): Promise<CartView>
}

export async function addToActiveCart(
  port: CartsPort,
  cookieCartId: string | undefined,
  productId: string,
): Promise<string> {
  const choice = chooseActiveCart({
    cookieCartId,
    carts: await port.listCarts(),
  })

  const cartId =
    choice.kind === "existing" ? choice.cartId : await port.createCart()

  await port.addProduct(cartId, productId)

  return cartId
}

export async function readActiveCart(
  port: CartsPort,
  cookieCartId: string | undefined,
): Promise<CartView | null> {
  const choice = chooseActiveCart({
    cookieCartId,
    carts: await port.listCarts(),
  })

  return choice.kind === "existing" ? port.readCart(choice.cartId) : null
}
