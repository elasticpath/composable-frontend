"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  initializeCart as sdkInitializeCart,
  getCartId,
  client,
  createAuthLocalStorageInterceptor,
} from "@epcc-sdk/sdks-shopper"

interface CartContextType {
  cartId: string | null
  cartItemCount: number
  isInitialized: boolean
  initializeCart: () => Promise<void>
  refreshCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  const initializeCart = async () => {
    try {
      // Use SDK to initialize cart (handles localStorage internally)
      await sdkInitializeCart()

      // Get the cart ID that was created/retrieved
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

  const refreshCart = () => {
    // Trigger cart refresh by dispatching a custom event
    window.dispatchEvent(new Event("cart:updated"))
  }

  useEffect(() => {
    // Configure the client first
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

    // Add request interceptor to include the token in requests
    client.interceptors.request.use(interceptor)

    // Now initialize the cart
    initializeCart()

    return () => {
      client.interceptors.request.eject(interceptor)
    }
  }, [])

  useEffect(() => {
    // Listen for cart updates
    const handleCartUpdate = () => {
      // This is a placeholder - in a real app you'd fetch cart details
      // For now, we'll just trigger a re-render
      setCartItemCount((prev) => prev)
    }

    window.addEventListener("cart:updated", handleCartUpdate)
    return () => window.removeEventListener("cart:updated", handleCartUpdate)
  }, [])

  return (
    <CartContext.Provider
      value={{
        cartId,
        cartItemCount,
        isInitialized,
        initializeCart,
        refreshCart,
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
