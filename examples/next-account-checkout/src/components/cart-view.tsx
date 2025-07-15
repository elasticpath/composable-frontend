"use client"

import { useEffect, useState } from "react"
import { useCart } from "./cart-provider"
import {
  getCartDetails,
  removeCartItem as removeItemAction,
  updateCartItemQuantity,
  applyPromotionCode,
  removePromotionCode,
  clearCart as clearCartAction,
  applyShippingOption,
} from "../app/actions"

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

    window.addEventListener("cart:updated", handleCartUpdate)
    return () => window.removeEventListener("cart:updated", handleCartUpdate)
  }, [cartId])

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

    if (shippingItem && shippingItem.sku) {
      const id = shippingItem.sku.replace("shipping_", "")
      setSelectedShipping(id)
    } else {
      setSelectedShipping(null)
    }
  }, [cart])

  // Check if cart is empty
  const isCartEmpty = !cart?.included?.items?.some(
    (item: any) => item.type === "cart_item",
  )

  const getActivePromotions = () => {
    if (!cart?.included?.items) return []
    return cart.included.items.filter(
      (item: any) => item.type === "promotion_item",
    )
  }

  const getCartPricing = () => {
    if (!cart?.data?.meta?.display_price) return null

    const pricing = cart.data.meta.display_price

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
        setError(
          !result.success && "error" in result
            ? result.error || "Failed to remove item"
            : "Failed to remove item",
        )
      } else {
        window.dispatchEvent(new Event("cart:updated"))
      }
    } catch (err) {
      console.error("Error removing item from cart:", err)
      setError("Failed to remove item")
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!cartId || newQuantity < 1) return

    try {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))
      const result = await updateCartItemQuantity(cartId, itemId, newQuantity)

      if (!result.success) {
        setError(result.error || "Failed to update quantity")
      } else {
        window.dispatchEvent(new Event("cart:updated"))
      }
    } catch (err) {
      console.error("Error updating item quantity:", err)
      setError("Failed to update quantity")
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  const applyPromotion = async (code: string) => {
    if (!cartId || !code.trim()) return

    try {
      setApplyingPromo(true)
      setPromoError(null)

      const result = await applyPromotionCode(cartId, code.trim())

      if (!result.success) {
        setPromoError(result.error || "Failed to apply promotion code")
      } else {
        setPromoCode("")
        window.dispatchEvent(new Event("cart:updated"))
      }
    } catch (err) {
      console.error("Error applying promotion code:", err)
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
        window.dispatchEvent(new Event("cart:updated"))
      }
    } catch (err) {
      console.error("Error removing promotion code:", err)
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
        window.dispatchEvent(new Event("cart:updated"))
      }
    } catch (err) {
      console.error("Error clearing cart:", err)
      setError("Failed to clear cart")
    } finally {
      setClearingCart(false)
    }
  }

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
          !result.success && "error" in result
            ? result.error || "Failed to apply shipping option"
            : "Failed to apply shipping option",
        )
      } else {
        window.dispatchEvent(new Event("cart:updated"))
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
    if (isCartEmpty) {
      setCheckoutError("Your cart is empty.")
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
    onCheckout && onCheckout()
  }

  // Get pricing details
  const pricing = getCartPricing()
  const activePromotions = getActivePromotions()
  const cartItems =
    cart?.included?.items?.filter((item: any) => item.type === "cart_item") ||
    []

  return (
    <div className="w-full">
      <h2 className="text-lg font-medium mb-3 text-black">Your Cart</h2>

      {isLoading && <p className="text-black">Loading cart...</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchCart}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {!isLoading && !error && cart && (
        <div className="w-full">
          <div className="mb-4">
            <span className="text-sm text-gray-500">Cart ID: </span>
            <span className="text-sm font-mono break-all">{cart.data?.id}</span>
          </div>

          {isCartEmpty ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-md font-medium mb-2 text-black">
                Your cart is empty
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Add some products to your cart to see them here.
              </p>
            </div>
          ) : (
            <div className="w-full">
              <h3 className="text-md font-medium mb-2 text-black">
                Items ({cartItems.length})
              </h3>
              <div className="grid gap-4">
                {cartItems.map((item: any) => {
                  const currentQuantity = item?.quantity || 1
                  const isUpdating = item.id ? updatingItems[item.id] : false

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-black font-medium text-base">
                              {item?.name || "Product"}
                            </h4>
                            {item?.sku && (
                              <div className="text-sm text-gray-500 mt-1">
                                SKU: {item.sku}
                              </div>
                            )}
                            <div className="text-sm text-gray-500 mt-3 flex items-center">
                              <div className="flex items-center">
                                <span className="mr-3">Quantity:</span>
                                <div className="flex items-center border border-gray-300 rounded">
                                  <button
                                    onClick={() =>
                                      item.id &&
                                      updateItemQuantity(
                                        item.id,
                                        currentQuantity - 1,
                                      )
                                    }
                                    disabled={
                                      isUpdating || currentQuantity <= 1
                                    }
                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Decrease quantity"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 12H4"
                                      />
                                    </svg>
                                  </button>
                                  <span className="px-3 py-1 border-x border-gray-300 min-w-[36px] text-center">
                                    {isUpdating ? "..." : currentQuantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      item.id &&
                                      updateItemQuantity(
                                        item.id,
                                        currentQuantity + 1,
                                      )
                                    }
                                    disabled={isUpdating}
                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Increase quantity"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {item?.meta?.display_price?.with_tax?.unit && (
                              <div className="font-medium text-black">
                                {
                                  item.meta.display_price.with_tax.unit
                                    .formatted
                                }
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                          <button
                            onClick={() => item.id && removeCartItem(item.id)}
                            disabled={isUpdating}
                            className="text-sm text-red-600 hover:text-red-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Promotion Code Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-md font-medium mb-3 text-black">
                  Promotion Code
                </h3>

                {/* Applied Promotions */}
                {activePromotions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-600 mb-2">
                      Applied Promotions:
                    </h4>
                    <ul className="space-y-2">
                      {activePromotions.map((promo: any) => (
                        <li
                          key={promo.id}
                          className="bg-green-50 border border-green-100 rounded p-2 flex justify-between items-center"
                        >
                          <div>
                            <span className="text-sm font-medium text-green-800">
                              {promo.code}
                            </span>
                            {promo.name && (
                              <p className="text-xs text-green-700 mt-1">
                                {promo.name}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              promo.code && removePromotion(promo.code)
                            }
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Promotion Code Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promotion code"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={applyingPromo}
                    />
                    {promoError && (
                      <p className="text-red-600 text-sm mt-1">{promoError}</p>
                    )}
                  </div>
                  <button
                    onClick={() => applyPromotion(promoCode)}
                    disabled={applyingPromo || !promoCode.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors duration-200"
                  >
                    {applyingPromo ? "Applying..." : "Apply Code"}
                  </button>
                </div>
              </div>

              {/* Shipping Options Section */}
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
                  <p className="text-gray-600 text-sm mt-2">
                    Updating shipping...
                  </p>
                )}
              </div>

              {/* Cart Summary */}
              {pricing && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-md font-medium mb-3 text-black">
                    Cart Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-black">{pricing.subtotal}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span
                        className={
                          pricing.hasDiscount
                            ? "text-green-600 font-medium"
                            : "text-gray-500"
                        }
                      >
                        {pricing.discount}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-500">{pricing.tax}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-500">{pricing.shipping}</span>
                    </div>

                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                      <span className="text-black">Total:</span>
                      <span className="text-black">{pricing.total}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Proceed to Checkout */}
              {onCheckout && !isCartEmpty && (
                <>
                  <button
                    onClick={handleProceedToCheckout}
                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
                  >
                    Checkout as guest
                  </button>
                  {checkoutError && (
                    <p className="mt-2 text-red-600 text-sm">{checkoutError}</p>
                  )}
                </>
              )}

              <button
                onClick={clearCart}
                disabled={isCartEmpty || clearingCart}
                className="mt-4 border border-gray-400 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {clearingCart ? "Clearing..." : "Clear Cart"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
