"use client"

import { useEffect, useState } from "react"
import { useCart } from "./cart-provider"

// Define custom cart update event name
const CART_UPDATED_EVENT = "cart:updated"

interface CartViewProps {
  onCheckout?: () => void
}

export function CartView({ onCheckout }: CartViewProps) {
  const { cartId } = useCart()
  const [cart, setCart] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
    {},
  )
  const [promoCode, setPromoCode] = useState("")
  const [promoError, setPromoError] = useState<string | null>(null)
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [clearingCart, setClearingCart] = useState(false)

  const fetchCart = async () => {
    if (!cartId) {
      setError("No cart found")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { getCartDetails } = await import("../app/actions")
      const result = await getCartDetails(cartId)

      if (!result.success) {
        setError(result.error || "Failed to fetch cart")
      } else {
        setCart(result.data)
      }
    } catch (err) {
      setError("An error occurred while fetching the cart")
      console.error("Cart fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()

    const handleCartUpdate = () => {
      fetchCart()
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate)
    return () =>
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate)
  }, [cartId])

  const getActivePromotions = () => {
    if (!cart?.included?.items) return []
    return cart.included.items.filter(
      (item: any) => item.type === "promotion_item",
    )
  }

  const getCartPricing = () => {
    const pricing = cart?.data?.meta?.display_price || {}
    return {
      total: pricing.with_tax?.formatted || "$0.00",
      subtotal: pricing.without_discount?.formatted || "$0.00",
      discount: pricing.discount?.formatted || "$0.00",
      tax: pricing.tax?.formatted || "$0.00",
      hasDiscount: (pricing.discount?.amount || 0) < 0,
    }
  }

  const removeCartItem = async (itemId: string) => {
    if (!cartId) return

    try {
      const { removeCartItem: removeItemAction } = await import(
        "../app/actions"
      )
      const result = await removeItemAction(cartId, itemId)

      if (!result.success) {
        setError(result.error || "Failed to remove item")
      } else {
        window.dispatchEvent(new Event(CART_UPDATED_EVENT))
      }
    } catch (err) {
      console.error("Error removing item from cart:", err)
      setError("Failed to remove item")
    }
  }

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!cartId) return

    try {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))

      const { updateCartItemQuantity } = await import("../app/actions")
      const result = await updateCartItemQuantity(cartId, itemId, newQuantity)

      if (!result.success) {
        setError(result.error || "Failed to update quantity")
      } else {
        window.dispatchEvent(new Event(CART_UPDATED_EVENT))
      }
    } catch (err) {
      console.error("Error updating item quantity:", err)
      setError("Failed to update quantity")
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const applyPromotion = async (code: string) => {
    if (!cartId || !code.trim()) {
      setPromoError("Please enter a promotion code")
      return
    }

    try {
      setApplyingPromo(true)
      setPromoError(null)

      const { applyPromotionCode } = await import("../app/actions")
      const result = await applyPromotionCode(cartId, code.trim())

      if (!result.success) {
        setPromoError(result.error || "Failed to apply promotion code")
      } else {
        setPromoCode("")
        window.dispatchEvent(new Event(CART_UPDATED_EVENT))
      }
    } catch (err) {
      console.error("Error applying promotion:", err)
      setPromoError("Failed to apply promotion code")
    } finally {
      setApplyingPromo(false)
    }
  }

  const removePromotion = async (code: string) => {
    if (!cartId) return

    try {
      const { removePromotionCode } = await import("../app/actions")
      const result = await removePromotionCode(cartId, code)

      if (!result.success) {
        setError(result.error || "Failed to remove promotion code")
      } else {
        window.dispatchEvent(new Event(CART_UPDATED_EVENT))
      }
    } catch (err) {
      console.error("Error removing promotion:", err)
      setError("Failed to remove promotion code")
    }
  }

  const clearCart = async () => {
    if (!cartId) return

    try {
      setClearingCart(true)

      const { clearCart: clearCartAction } = await import("../app/actions")
      const result = await clearCartAction(cartId)

      if (!result.success) {
        setError(result.error || "Failed to clear cart")
      } else {
        window.dispatchEvent(new Event(CART_UPDATED_EVENT))
      }
    } catch (err) {
      console.error("Error clearing cart:", err)
      setError("Failed to clear cart")
    } finally {
      setClearingCart(false)
    }
  }

  const handleProceedToCheckout = () => {
    if (
      !cart?.included?.items?.some((item: any) => item.type === "cart_item")
    ) {
      setError("Your cart is empty")
      return
    }

    if (onCheckout) {
      onCheckout()
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-medium mb-3 text-black">Cart</h3>
        <p className="text-gray-600">Loading cart...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-medium mb-3 text-black">Cart</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => {
            setError(null)
            fetchCart()
          }}
          className="mt-2 text-blue-600 hover:text-blue-500 text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  const cartItems =
    cart?.included?.items?.filter((item: any) => item.type === "cart_item") ||
    []
  const activePromotions = getActivePromotions()
  const pricing = getCartPricing()

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-black">Cart</h3>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            disabled={clearingCart}
            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {clearingCart ? "Clearing..." : "Clear All"}
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Your cart is empty</p>
      ) : (
        <div className="space-y-4">
          {/* Cart Items */}
          <div className="space-y-3">
            {cartItems.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded"
              >
                <div className="flex-1">
                  <div className="font-medium text-black">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {item.meta?.display_price?.with_tax?.value?.formatted ||
                      "$0.00"}{" "}
                    each
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateItemQuantity(item.id, item.quantity - 1)
                    }
                    disabled={updatingItems[item.id]}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-black">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateItemQuantity(item.id, item.quantity + 1)
                    }
                    disabled={updatingItems[item.id]}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeCartItem(item.id)}
                    className="ml-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Promotion Code Section */}
          <div className="border-t pt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Promotion code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <button
                onClick={() => applyPromotion(promoCode)}
                disabled={applyingPromo}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {applyingPromo ? "Applying..." : "Apply"}
              </button>
            </div>
            {promoError && (
              <p className="text-red-600 text-sm mt-1">{promoError}</p>
            )}
          </div>

          {/* Active Promotions */}
          {activePromotions.length > 0 && (
            <div className="space-y-2">
              {activePromotions.map((promotion: any) => (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                >
                  <span className="text-green-800 text-sm">
                    Promotion: {promotion.sku || promotion.name}
                  </span>
                  <button
                    onClick={() => removePromotion(promotion.sku)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Cart Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-black">{pricing.subtotal}</span>
            </div>
            {pricing.hasDiscount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="text-green-600">{pricing.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="text-black">{pricing.tax}</span>
            </div>
            <div className="flex justify-between font-medium text-lg border-t pt-2">
              <span className="text-black">Total:</span>
              <span className="text-black">{pricing.total}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="border-t pt-4">
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded font-medium hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
