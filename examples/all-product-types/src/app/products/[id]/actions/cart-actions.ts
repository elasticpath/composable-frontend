"use server"

import { z } from "zod"
import { manageCarts } from "@epcc-sdk/sdks-shopper"
import { createBundleFormSchema } from "../../../components/bundles/validation-schema"
import { formSelectedOptionsToData } from "../../../components/bundles/form-parsers"
import { configureClient } from "../../../../lib/client"

// Configure the client
configureClient()

/**
 * addToBundleAction - Server Action that adds a bundle to the cart
 */
export async function addToBundleAction(
  data: z.infer<ReturnType<typeof createBundleFormSchema>>,
) {
  // Note: In a real implementation, you would get the cart ID from cookies
  // For this example, we'll use a placeholder cart ID
  const cartId = "demo-cart-id"
  
  try {
    const result = await manageCarts({
      path: { cartID: cartId },
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