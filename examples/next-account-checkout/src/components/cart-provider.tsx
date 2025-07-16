"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  initializeCart as sdkInitializeCart,
  getCartId,
  client,
  createAuthLocalStorageInterceptor,
} from "@epcc-sdk/sdks-shopper"
import { getCartDetails } from "../app/actions"

interface CartContextType {
  cartId: string | null
  cartItemCount: number
  isInitialized: boolean
  initializeCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  const initializeCart = async () => {
    try {
      await sdkInitializeCart()

      const cartId = getCartId()
      if (cartId) {
        setCartId(cartId)
      }
    } catch (error) {
      console.error("Failed to initialize cart:", error)
    } finally {
      setIsInitialized(true)
    }
  }

  const updateCartItemCount = async (cartId: string) => {
    try {
      const result = await getCartDetails(cartId)
      if (result.success && result.data) {
        const cartItems =
          result.data.included?.items?.filter(
            (item: any) => item.type === "cart_item",
          ) || []
        const totalItems = cartItems.reduce(
          (sum: number, item: any) => sum + (item.quantity || 0),
          0,
        )
        setCartItemCount(totalItems)
      }
    } catch (error) {
      console.error("Failed to update cart item count:", error)
    }
  }

  useEffect(() => {
    client.setConfig({
      baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL!,
    })

    if (!process.env.NEXT_PUBLIC_EPCC_CLIENT_ID) {
      console.error("Missing NEXT_PUBLIC_EPCC_CLIENT_ID")
      setIsInitialized(true)
      return
    }

    const interceptor = createAuthLocalStorageInterceptor({
      clientId: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID,
    })

    client.interceptors.request.use(interceptor)

    initializeCart()

    return () => {
      client.interceptors.request.eject(interceptor)
    }
  }, [])

  useEffect(() => {
    const handleCartUpdate = () => {
      if (cartId) {
        updateCartItemCount(cartId)
      }
    }

    if (cartId) {
      updateCartItemCount(cartId)
    }

    window.addEventListener("cart:updated", handleCartUpdate)
    return () => window.removeEventListener("cart:updated", handleCartUpdate)
  }, [cartId])

  return (
    <CartContext.Provider
      value={{
        cartId,
        cartItemCount,
        isInitialized,
        initializeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
