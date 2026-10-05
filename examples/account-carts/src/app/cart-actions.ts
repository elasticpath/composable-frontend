"use server"

import { revalidatePath } from "next/cache"
import { setActiveCartCookie } from "@/lib/active-cart-cookie"
import { addToActiveCart } from "@/lib/cart-service"
import { requireCartContext } from "@/lib/cart-context"
import { describeFailure } from "@/lib/cart-failure"
import { ADD_REFUSED_MESSAGE } from "@/lib/messages"
import { saveForLater } from "@/lib/save-for-later"

const PRODUCT_ID = /^[A-Za-z0-9_-]{1,64}$/

export type AddToCartResult =
  | { status: "added" }
  | { status: "failed"; message: string }

export async function addToCart(productId: string): Promise<AddToCartResult> {
  if (!PRODUCT_ID.test(productId)) {
    return { status: "failed", message: ADD_REFUSED_MESSAGE }
  }

  const { port, cookieCartId } = await requireCartContext("/")

  let cartId: string
  try {
    cartId = await addToActiveCart(port, cookieCartId, productId)
  } catch (error) {
    console.error(error)
    return { status: "failed", message: describeFailure(error, "add") }
  }

  await setActiveCartCookie(cartId)

  revalidatePath("/cart")

  return { status: "added" }
}

export type SaveCartResult =
  | { status: "saved"; name: string }
  | { status: "nothing-to-save" }
  | { status: "invalid-name"; problem: string }
  | { status: "failed" }

export async function saveCartForLater(
  requestedName: string,
): Promise<SaveCartResult> {
  const { port, cookieCartId } = await requireCartContext("/cart")

  let result
  try {
    result = await saveForLater(port, cookieCartId, requestedName)
  } catch (error) {
    console.error(error)
    return { status: "failed" }
  }

  if (result.status !== "saved") {
    return result
  }

  await setActiveCartCookie(result.activeCartId)

  revalidatePath("/cart")
  revalidatePath("/saved-carts")

  return { status: "saved", name: result.name }
}
