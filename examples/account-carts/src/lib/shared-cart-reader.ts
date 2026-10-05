import "server-only"

import { createClient, getACart } from "@epcc-sdk/sdks-shopper"
import { CartsUnavailableError } from "./carts-port"
import { getServerAccessToken } from "./server-credentials"
import { toSharedCart, type SharedCart } from "./shared-cart"

export type SharedCartSdk = { getACart: typeof getACart }

export function createSharedCartReader({
  serverToken,
  sdk = { getACart },
}: {
  serverToken: () => Promise<string>
  sdk?: SharedCartSdk
}): (cartId: string) => Promise<SharedCart | null> {
  const client = createClient({
    baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
  })

  return async (cartId) => {
    let response
    try {
      response = await sdk.getACart({
        client,
        headers: { Authorization: `Bearer ${await serverToken()}` },
        path: { cartID: cartId },
        query: { include: ["items"] },
      })
    } catch (cause) {
      throw new CartsUnavailableError("reading the shared cart", { cause })
    }

    if (response.response?.status === 404) return null

    if (response.error || !response.data) {
      throw new CartsUnavailableError("reading the shared cart", {
        cause: response.error,
      })
    }

    const cart = toSharedCart(response.data)

    return cart.lines.length === 0 ? null : cart
  }
}

export const readSharedCart = createSharedCartReader({
  serverToken: getServerAccessToken,
})
