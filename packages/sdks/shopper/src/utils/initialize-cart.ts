import { createACart } from "../client"
import { CART_STORAGE_KEY } from "../constants/credentials"

/**
 * Initialize a cart and return the cartId
 * @returns {Promise<string>} The cartId
 */
export async function initializeCart(options?: {
  storageKey?: string
}): Promise<string> {
  let cartId = localStorage.getItem(options?.storageKey ?? CART_STORAGE_KEY)

  // check if cartId is missing
  if (!cartId) {
    // Create a new cart
    const cartResponse = await createACart({
      body: {
        data: {
          name: "Storefront cart",
          description: "Standard cart created by the Storefront SDK",
        },
      },
    })

    if (!cartResponse.data?.data?.id) {
      throw new Error("Failed to create cart")
    }

    cartId = cartResponse.data.data.id
    // Store the cartId in localStorage
    localStorage.setItem(options?.storageKey ?? CART_STORAGE_KEY, cartId)
  }

  return cartId
}
