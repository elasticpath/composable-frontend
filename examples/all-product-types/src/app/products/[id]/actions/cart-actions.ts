"use server"

import { cookies } from "next/headers"
import { z } from "zod"
import { createACart, manageCarts } from "@epcc-sdk/sdks-shopper"
import { createBundleFormSchema } from "../../../components/bundles/validation-schema"
import { formSelectedOptionsToData } from "../../../components/bundles/form-parsers"
import { configureClient } from "../../../../lib/client"
import { CART_COOKIE_KEY } from "../../../constants"

configureClient()

async function shopperCartId(): Promise<
  { cartId: string } | { error: unknown }
> {
  const cookieStore = await cookies()
  const existingCartId = cookieStore.get(CART_COOKIE_KEY)?.value
  if (existingCartId) return { cartId: existingCartId }

  const created = await createACart({
    body: { data: { name: "All product types cart" } },
  })
  const cartId = created.data?.data?.id

  if (created.error || !cartId) {
    return {
      error: created.error ?? new Error("The store did not create a cart"),
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

  return { cartId }
}

export async function addToBundleAction(
  data: z.infer<ReturnType<typeof createBundleFormSchema>>,
) {
  try {
    const cart = await shopperCartId()
    if ("error" in cart) {
      console.error("Failed to find or create the shopper's cart:", cart.error)
      return { data: null, error: cart.error }
    }

    const result = await manageCarts({
      path: { cartID: cart.cartId },
      body: {
        data: {
          type: "cart_item",
          id: data.productId,
          bundle_configuration: formSelectedOptionsToData(data.selectedOptions),
          quantity: data.quantity,
          ...(data.location && { location: data.location }),
        },
      },
    })

    return {
      data: result.data,
      error: result.error,
    }
  } catch (error) {
    console.error("Failed to add bundle to cart:", error)
    return {
      data: null,
      error: error,
    }
  }
}
