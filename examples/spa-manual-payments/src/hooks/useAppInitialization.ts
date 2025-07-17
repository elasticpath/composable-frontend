import { useState, useEffect } from "react"
import {
  getByContextAllProducts,
  getCartId,
  initializeCart,
} from "@epcc-sdk/sdks-shopper"

export function useAppInitialization() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cartId, setCartId] = useState<string | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeCart()

        const response = await getByContextAllProducts()
        if (response.data?.data && response.data.data.length > 0) {
          setIsAuthenticated(true)
        }

        const currentCartId = getCartId()
        setCartId(currentCartId)
      } catch (error) {
        console.error("Failed to initialize app:", error)
        setIsAuthenticated(false)
      }
    }

    initializeApp()
  }, [])

  const refreshCartId = () => {
    const currentCartId = getCartId()
    setCartId(currentCartId)
  }

  return {
    isAuthenticated,
    cartId,
    refreshCartId,
  }
}
