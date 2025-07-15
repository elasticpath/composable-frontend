"use client"

import { useEffect, useState } from "react"
import { useCart } from "./cart-provider"
import { Button, Input } from "./ui"
import {
  getCartDetails,
  removeCartItem as removeItemAction,
  updateCartItemQuantity,
  applyPromotionCode,
  removePromotionCode,
  clearCart as clearCartAction,
  applyShippingOption,
} from "../app/actions"

// Define custom cart update event name
const CART_UPDATED_EVENT = "cart:updated"

// Shipping options definition
const SHIPPING_OPTIONS = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "Delivery in 5-7 business days",
    price_cents: 500,
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "Delivery in 1-2 business days",
    price_cents: 1500,
  },
] as const

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

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
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  // Shipping state
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [applyingShipping, setApplyingShipping] = useState(false)

  const fetchCart = async () => {
    if (!cartId) {
      setError("No cart found")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
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

    // helper to derive shipping cost from custom item
    const getShippingCost = () => {
      if (!cart?.included?.items) return "$0.00"
      const shippingItem = cart.included.items.find(
        (item: any) =>
          item.type === "custom_item" && item.sku?.startsWith("shipping_"),
      ) as any
      const formatted =
        shippingItem?.meta?.display_price?.with_tax?.value?.formatted
      return formatted || "$0.00"
    }

    const shippingFormatted = getShippingCost()

    return {
      total: pricing.with_tax?.formatted || "$0.00",
      subtotal: pricing.without_discount?.formatted || "$0.00",
      discount: pricing.discount?.formatted || "$0.00",
      tax: pricing.tax?.formatted || "$0.00",
      shipping: shippingFormatted,
      hasDiscount: (pricing.discount?.amount || 0) < 0,
    }
  }

  const removeCartItem = async (itemId: string) => {
    if (!cartId) return

    try {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))
      const result = await removeItemAction(cartId, itemId)

      if (!result.success) {
        setError(result.error || "Failed to remove item")
      } else {
        window.dispatchEvent(new Event(CART_UPDATED_EVENT))
      }
    } catch (err) {
      console.error("Error removing item from cart:", err)
      setError("Failed to remove item")
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!cartId) return

    try {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))
      const result = await updateCartItemQuantity(cartId, itemId, newQuantity)

      if (!result.success) {
        setError(
          "error" in result
            ? result.error || "Failed to update quantity"
            : "Failed to update quantity",
        )
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

  // Derive currently selected shipping option from cart
  useEffect(() => {
    if (!cart?.included?.items) {
      setSelectedShipping(null)
      return
    }

    const shippingItem = cart.included.items.find(
      (item: any) =>
        item.type === "custom_item" && item.sku?.startsWith("shipping_"),
    )

    if (shippingItem && (shippingItem as any).sku) {
      const id = (shippingItem as any).sku.replace("shipping_", "")
      setSelectedShipping(id)
    } else {
      setSelectedShipping(null)
    }
  }, [cart])

  // This shipping example is a simplified example of how to apply a shipping option to a cart, that utilises custom cart items.
  const applyShipping = async (optionId: string) => {
    if (!cartId) {
      setShippingError("Cart not found")
      return
    }

    try {
      setApplyingShipping(true)
      setShippingError(null)

      const option = SHIPPING_OPTIONS.find((o) => o.id === optionId)
      if (!option) {
        setShippingError("Shipping option not found")
        return
      }

      const result = await applyShippingOption(cartId, optionId, {
        name: option.name,
        description: option.description,
        price_cents: option.price_cents,
      })

      if (!result.success) {
        setShippingError(
          "error" in result
            ? result.error || "Failed to apply shipping option"
            : "Failed to apply shipping option",
        )
      } else {
        window.dispatchEvent(new Event(CART_UPDATED_EVENT))
      }
    } catch (err) {
      console.error("Error applying shipping option:", err)
      setShippingError("Failed to apply shipping option")
    } finally {
      setApplyingShipping(false)
    }
  }

  // Handle radio change
  const handleShippingChange = (optionId: string) => {
    if (applyingShipping) return // prevent duplicate triggers
    setSelectedShipping(optionId)
    applyShipping(optionId)
    setCheckoutError(null) // clear any prior error when user selects
  }

  const handleProceedToCheckout = () => {
    if (
      !cart?.included?.items?.some((item: any) => item.type === "cart_item")
    ) {
      setCheckoutError("Your cart is empty")
      return
    }

    if (promoError) {
      setCheckoutError(promoError)
      return
    }

    if (!selectedShipping) {
      setCheckoutError(
        "Please select a shipping option before proceeding to checkout.",
      )
      return
    }

    setCheckoutError(null)
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
        <Button
          variant="ghost"
          size="small"
          onClick={() => {
            setError(null)
            fetchCart()
          }}
        >
          Try again
        </Button>
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
          <Button
            variant="ghost"
            size="small"
            onClick={clearCart}
            disabled={clearingCart}
          >
            {clearingCart ? "Clearing..." : "Clear All"}
          </Button>
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
                <div className="flex items-center ml-2 space-x-2">
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() =>
                      updateItemQuantity(item.id, item.quantity - 1)
                    }
                    disabled={updatingItems[item.id]}
                    className="w-8 h-8 !px-0 !py-0"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-black">
                    {item.quantity}
                  </span>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() =>
                      updateItemQuantity(item.id, item.quantity + 1)
                    }
                    disabled={updatingItems[item.id]}
                    className="w-8 h-8 !px-0 !py-0"
                  >
                    +
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => removeCartItem(item.id)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Promotion Code Section */}
          <div className="border-t border-gray-300 border-gray-300 pt-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Promotion code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 text-sm"
              />
              <Button
                size="small"
                onClick={() => applyPromotion(promoCode)}
                disabled={applyingPromo}
              >
                {applyingPromo ? "Applying..." : "Apply"}
              </Button>
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
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => removePromotion(promotion.sku)}
                    className="!text-red-600 hover:!text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Shipping Options */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-md font-medium mb-3 text-black">
              Shipping Options
            </h3>
            <div className="space-y-3">
              {SHIPPING_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 ${
                    applyingShipping
                      ? "opacity-50 cursor-not-allowed hover:white"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingOption"
                    value={option.id}
                    checked={selectedShipping === option.id}
                    onChange={() => handleShippingChange(option.id)}
                    className="mt-1 mr-3"
                    disabled={applyingShipping}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-black block">
                      {option.name} - {formatPrice(option.price_cents)}
                    </span>
                    <span className="text-xs text-gray-500 block mt-1">
                      {option.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {shippingError && (
              <p className="text-red-600 text-sm mt-2">{shippingError}</p>
            )}
            {applyingShipping && (
              <p className="text-gray-600 text-sm mt-2">Updating shipping...</p>
            )}
          </div>

          {/* Cart Summary */}
          <div className="border-t border-gray-300 pt-4 space-y-2">
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
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-black">{pricing.shipping}</span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-100">
              <span className="text-black">Total:</span>
              <span className="text-black">{pricing.total}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="border-t border-gray-300 pt-4">
            <Button onClick={handleProceedToCheckout} className="w-full">
              Proceed to Checkout
            </Button>
            {checkoutError && (
              <p className="mt-2 text-red-600 text-sm">{checkoutError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
