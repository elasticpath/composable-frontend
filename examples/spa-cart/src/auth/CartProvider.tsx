"use client"

import React, { useCallback, useEffect } from "react"
import { createACart } from "@epcc-sdk/sdks-shopper"
import { CART_COOKIE_KEY } from "../constants"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const initCart = useCallback(async () => {
    const cartId = localStorage.getItem(CART_COOKIE_KEY)

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

      // Store the cartId in localStorage
      localStorage.setItem(CART_COOKIE_KEY, cartResponse.data.data.id)
    }
  }, [])

  // Initialize cart if not already initialized
  useEffect(() => {
    initCart()
  }, [])

  return <>{children}</>
}
