"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { addToActiveCart } from "@/lib/cart-service"
import { requireCartContext } from "@/lib/cart-context"
import { ACTIVE_CART_COOKIE_KEY } from "./constants"

const PRODUCT_ID = /^[A-Za-z0-9_-]{1,64}$/
const ACTIVE_CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export type AddToCartResult = { status: "added" } | { status: "failed" }

export async function addToCart(productId: string): Promise<AddToCartResult> {
  if (!PRODUCT_ID.test(productId)) {
    return { status: "failed" }
  }

  const { port, cookieCartId } = await requireCartContext("/")

  let cartId: string
  try {
    cartId = await addToActiveCart(port, cookieCartId, productId)
  } catch (error) {
    console.error(error)
    return { status: "failed" }
  }

  const cookieStore = await cookies()
  cookieStore.set({
    name: ACTIVE_CART_COOKIE_KEY,
    value: cartId,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ACTIVE_CART_COOKIE_MAX_AGE_SECONDS,
  })

  revalidatePath("/cart")

  return { status: "added" }
}
