import { useEffect, useState } from "react"
import { getCart } from "@epcc-sdk/sdks-shopper"
import { CART_COOKIE_KEY } from "../constants"

// Define a simplified type for cart item details
type CartItemDetail = {
  id: string
  type: string
  name?: string
  sku?: string
  quantity?: number
  unit_price?: {
    amount: number
    currency?: string
    includes_tax?: boolean
  }
  meta?: {
    display_price?: {
      with_tax?: {
        unit?: {
          formatted?: string
        }
      }
    }
  }
}

// Define custom cart update event name
const CART_UPDATED_EVENT = "cart:updated"

export function CartView() {
  const [cart, setCart] = useState<
    Awaited<ReturnType<typeof getCart>>["data"] | null
  >(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCart = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get cartId from localStorage
      const cartId = localStorage.getItem(CART_COOKIE_KEY)

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

  // Get cart item details from included data
  const getCartItemDetails = (
    itemId: string | undefined,
  ): CartItemDetail | null => {
    if (!itemId || !cart?.included?.items) return null
    return (
      (cart.included.items.find(
        (item) => item.id === itemId,
      ) as CartItemDetail) || null
    )
  }

  // Function to remove item from cart
  const removeCartItem = async (itemId: string) => {
    try {
      const cartId = localStorage.getItem(CART_COOKIE_KEY)
      if (!cartId) return

      // TODO: Implement actual remove item API call here
      // For now, we'll just simulate a successful removal
      console.log(`Removing item ${itemId} from cart ${cartId}`)

      // Refresh the cart after removal
      window.dispatchEvent(new Event(CART_UPDATED_EVENT))
    } catch (err) {
      console.error("Error removing item from cart:", err)
    }
  }

  return (
    <div className="cart-view">
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
        <div className="cart-content">
          <div className="mb-4">
            <span className="text-sm text-gray-500">Cart ID: </span>
            <span className="text-sm font-mono break-all">{cart.data?.id}</span>
          </div>

          {isCartEmpty ? (
            <div className="empty-cart bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
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
            <div className="cart-items">
              <h3 className="text-md font-medium mb-2 text-black">
                Items ({cart.data?.relationships?.items?.data?.length})
              </h3>
              <div className="grid gap-4">
                {cart.data?.relationships?.items?.data?.map((itemRef) => {
                  const item = getCartItemDetails(itemRef.id)
                  return (
                    <div
                      key={itemRef.id}
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
                            <div className="text-sm text-gray-500 mt-2 flex items-center">
                              <span>Quantity: {item?.quantity || 1}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {item?.unit_price && (
                              <div className="font-medium text-black">
                                {item.meta?.display_price?.with_tax?.unit
                                  ?.formatted ||
                                  `$${(item.unit_price.amount / 100).toFixed(
                                    2,
                                  )}`}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                          <button
                            onClick={() =>
                              itemRef.id && removeCartItem(itemRef.id)
                            }
                            className="text-sm text-red-600 hover:text-red-800 flex items-center"
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
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-black font-bold">
                  <span>Items in cart:</span>
                  <span>{cart.data?.relationships?.items?.data?.length}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={fetchCart}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
          >
            Refresh Cart
          </button>
        </div>
      )}
    </div>
  )
}
