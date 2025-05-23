import { createACart } from "../client"
import { CART_STORAGE_KEY } from "../constants/credentials"

export let PERSISTED_CART_STORAGE_KEY = CART_STORAGE_KEY

/**
 * Initialize a cart and return the cartId
 * @returns {Promise<string>} The cartId
 */
export async function initializeCart(options?: {
  storageKey?: string
}): Promise<string> {
  PERSISTED_CART_STORAGE_KEY = options?.storageKey ?? PERSISTED_CART_STORAGE_KEY
  let cartId = localStorage.getItem(PERSISTED_CART_STORAGE_KEY)

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
    localStorage.setItem(PERSISTED_CART_STORAGE_KEY, cartId)
  }

  return cartId
}
