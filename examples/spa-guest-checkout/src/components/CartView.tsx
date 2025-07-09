import { useEffect, useState } from "react"
import {
  getCart,
  deleteACartItem,
  updateACartItem,
  manageCarts,
  deleteAPromotionViaPromotionCode,
  type CartItemsObjectResponse,
  type CartItemResponseObject,
  getCartId,
} from "@epcc-sdk/sdks-shopper"

// Define custom cart update event name
const CART_UPDATED_EVENT = "cart:updated"

export function CartView() {
  const [cart, setCart] = useState<
    Awaited<ReturnType<typeof getCart>>["data"] | null
  >(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
    {},
  )
  const [promoCode, setPromoCode] = useState("")
  const [promoError, setPromoError] = useState<string | null>(null)
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [removingPromo, setRemovingPromo] = useState(false)

  const fetchCart = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get cartId from localStorage
      const cartId = getCartId()

      if (!cartId) {
        setError("No cart found")
        setIsLoading(false)
        return
      }

      const response = await getCart({
        path: {
          cartID: cartId,
        },
        query: {
          include: ["items"],
        },
      })

      if (response.data?.data) {
        setCart(response.data)
      } else {
        setError("Failed to load cart")
      }
    } catch (err) {
      setError("An error occurred while fetching the cart")
      console.error("Cart fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // For demo purposes, we'll listen for a custom event to trigger a cart update but in a real
  // application you would use a library like react-query or SWR to handle this.
  useEffect(() => {
    fetchCart()

    // Create a function to handle custom cart update events
    const handleCartUpdate = () => {
      fetchCart()
    }

    // Listen for custom cart update events
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate)

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate)
    }
  }, [])

  // Check if cart is empty
  const isCartEmpty = !cart?.data?.relationships?.items?.data?.length

  // Get active promotion items
  const getActivePromotions = () => {
    if (!cart?.included?.items) return []

    return cart?.included?.items.filter(
      (item) => item.type === "promotion_item",
    )
  }

  // Get cart pricing information
  const getCartPricing = () => {
    if (!cart?.data?.meta?.display_price) return null

    const pricing = cart.data.meta.display_price

    return {
      total: pricing.with_tax?.formatted || "$0.00",
      subtotal: pricing.without_discount?.formatted || "$0.00",
      discount: pricing.discount?.formatted || "$0.00",
      tax: pricing.tax?.formatted || "$0.00",
      shipping: pricing.shipping?.formatted || "$0.00",
      hasDiscount: (pricing.discount?.amount || 0) < 0,
    }
  }

  // Function to remove item from cart
  const removeCartItem = async (itemId: string) => {
    try {
      const cartId = getCartId()
      if (!cartId) return

      await deleteACartItem({
        path: {
          cartID: cartId,
          cartitemID: itemId,
        },
      })

      // Refresh the cart after removal
      window.dispatchEvent(new Event(CART_UPDATED_EVENT))
    } catch (err) {
      console.error("Error removing item from cart:", err)
    }
  }

  // Function to update item quantity in cart
  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    try {
      if (newQuantity < 1) {
        // If quantity is less than 1, remove the item
        await removeCartItem(itemId)
        return
      }

      setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))

      const cartId = getCartId()
      if (!cartId) return

      await updateACartItem({
        path: {
          cartID: cartId,
          cartitemID: itemId,
        },
        body: {
          data: {
            id: itemId,
            quantity: newQuantity,
          },
        },
      })

      // Refresh the cart after update
      window.dispatchEvent(new Event(CART_UPDATED_EVENT))
    } catch (err) {
      console.error("Error updating item quantity:", err)
      setError("Failed to update quantity")
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
    }
  }

  // Function to apply promotion code
  const applyPromotion = async (code: string) => {
    console.log("Applying promotion code:", code)
    if (!code.trim()) {
      setPromoError("Please enter a promotion code")
      return
    }

    console.log("after trim:", code)

    try {
      setApplyingPromo(true)
      setPromoError(null)

      const cartId = getCartId()
      if (!cartId) {
        setPromoError("Cart not found")
        return
      }

      console.log("before manageCarts")

      await manageCarts({
        path: {
          cartID: cartId,
        },
        body: {
          data: {
            type: "promotion_item",
            code: code.trim(),
          },
        },
      })
      console.log("after manageCarts")

      // Clear the input and refresh cart
      setPromoCode("")
      window.dispatchEvent(new Event(CART_UPDATED_EVENT))
    } catch (err) {
      console.error("Error applying promotion code:", err)
      setPromoError("Invalid promotion code or cannot be applied to this cart")
    } finally {
      setApplyingPromo(false)
    }
  }

  // Function to remove a promotion
  const removePromotion = async (code: string) => {
    try {
      setRemovingPromo(true)

      const cartId = getCartId()
      if (!cartId) return

      await deleteAPromotionViaPromotionCode({
        path: {
          cartID: cartId,
          promoCode: code,
        },
      })

      window.dispatchEvent(new Event(CART_UPDATED_EVENT))
    } catch (err) {
      console.error("Error removing promotion:", err)
      setPromoError("Failed to remove promotion")
    } finally {
      setRemovingPromo(false)
    }
  }

  // Get pricing details
  const pricing = getCartPricing()
  const activePromotions = getActivePromotions()

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
                Items (
                {cart.data?.relationships?.items?.data?.filter(
                  (item) => item.type === "cart_item",
                ).length || 0}
                )
              </h3>
              <div className="grid gap-4">
                {cart.included?.items?.filter(isCartItem).map((item) => {
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
                            {(
                              item?.meta?.display_price?.with_tax as {
                                unit: { formatted: string }
                              }
                            )?.unit && (
                              <div className="font-medium text-black">
                                {
                                  (
                                    item.meta?.display_price?.with_tax as {
                                      unit: { formatted: string }
                                    }
                                  )?.unit.formatted
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
                      {activePromotions.map((promo) => (
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
                            disabled={removingPromo}
                            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {removingPromo ? "Removing..." : "Remove"}
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

              <button
                onClick={fetchCart}
                className="mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
              >
                Refresh Cart
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function isCartItem(
  item: CartItemsObjectResponse,
): item is CartItemResponseObject {
  return item.type === "cart_item"
}
