import { useEffect, useState } from "react"
import {
  getByContextAllProducts,
  getCartId,
  manageCarts,
  checkoutApi,
  getStock,
  initializeCart,
  type OrderResponse,
} from "@epcc-sdk/sdks-shopper"
import { OrderCreator } from "./components/OrderCreator"
import { ManualPayment } from "./components/ManualPayment"
import { OrderStatus } from "./components/OrderStatus"

function App() {
  const [currentStep, setCurrentStep] = useState<
    "create" | "payment" | "complete"
  >("create")
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cartId, setCartId] = useState<string | null>(null)

  // Initialize cart and check authentication on startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeCart()

        // Test authentication by fetching products
        const response = await getByContextAllProducts()
        if (response.data?.data && response.data.data.length > 0) {
          setIsAuthenticated(true)
        }

        // Get current cart ID
        const currentCartId = getCartId()
        setCartId(currentCartId)
      } catch (error) {
        console.error("Failed to initialize app:", error)
        setIsAuthenticated(false)
      }
    }

    initializeApp()
  }, [])

  // Helper function to check if product has available stock
  const checkProductStock = async (productId: string): Promise<boolean> => {
    try {
      const stockResponse = await getStock({
        path: { product_uuid: productId },
      })

      if (!stockResponse.data?.data?.attributes) {
        return true // If no stock data, assume available
      }

      const available = Number(
        stockResponse.data.data.attributes.available || 0,
      )
      return available > 0
    } catch (error) {
      console.warn(`Could not check stock for product ${productId}:`, error)
      return true // If stock check fails, assume available
    }
  }

  const createIncompleteOrder = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get products and find one that can be added to cart
      const productsResponse = await getByContextAllProducts()
      const allProducts = productsResponse.data?.data || []

      if (allProducts.length === 0) {
        throw new Error("No products available to create order")
      }

      // Filter for products that can be added to cart:
      // - Simple products (no variations)
      // - Child products (variants with parent relationship)
      // Exclude base products (parents that cannot be added to cart)
      const addableProducts = allProducts.filter((product: any) => {
        // If it has relationships.parent, it's a child product (variant) - can add to cart
        if (product.relationships?.parent) {
          return true
        }
        // If it has base_product attribute set to true, it's a base product - cannot add to cart
        if (product.attributes?.base_product) {
          return false
        }
        // Otherwise it's likely a simple product - can add to cart
        return true
      })

      if (addableProducts.length === 0) {
        throw new Error(
          "No products available that can be added to cart. All products are base products that require variant selection.",
        )
      }

      // Find the first product with available stock
      let firstProduct = null
      for (const product of addableProducts) {
        if (!product.id) continue // Skip products without ID
        const hasStock = await checkProductStock(product.id)
        if (hasStock) {
          firstProduct = product
          break
        }
      }

      if (!firstProduct) {
        throw new Error(
          "No products available with sufficient stock. Please check your inventory or try again later.",
        )
      }
      const cartId = getCartId()

      if (!cartId) {
        throw new Error("No cart found. Please refresh the page.")
      }

      // Add product to cart
      await manageCarts({
        path: {
          cartID: cartId,
        },
        body: {
          data: {
            type: "cart_item",
            id: firstProduct.id,
            quantity: 1,
          },
        },
      })

      // Create checkout with minimal customer data (using the correct API structure)
      const customerData = {
        customer: {
          email: "test@example.com",
          name: "Test Customer",
        },
        billing_address: {
          first_name: "Test",
          last_name: "Customer",
          company_name: "",
          line_1: "123 Test Street",
          line_2: "",
          city: "Test City",
          region: "Test State",
          postcode: "12345",
          county: "",
          country: "US",
        },
        shipping_address: {
          first_name: "Test",
          last_name: "Customer",
          company_name: "",
          line_1: "123 Test Street",
          line_2: "",
          city: "Test City",
          region: "Test State",
          postcode: "12345",
          county: "",
          country: "US",
          phone_number: "",
          instructions: "",
        },
      }

      const checkoutResponse = await checkoutApi({
        path: { cartID: cartId },
        body: { data: customerData as any },
      })

      const orderData = checkoutResponse.data?.data
      if (!orderData) {
        throw new Error("Failed to create order")
      }

      const newOrder: OrderResponse = orderData

      setOrder(newOrder)
      setCurrentStep("payment")

      // Update cart ID (cart should now be empty after checkout)
      const updatedCartId = getCartId()
      setCartId(updatedCartId)

      // Fire cart update event
      window.dispatchEvent(new Event("cart:updated"))
    } catch (err: any) {
      setError(err?.message || "Failed to create order")
      console.error("Order creation error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentComplete = (updatedOrder: OrderResponse) => {
    setOrder(updatedOrder)
    setCurrentStep("complete")
  }

  const resetFlow = () => {
    setOrder(null)
    setCurrentStep("create")
    setError(null)
  }

  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-semibold mb-2 text-gray-900">
            Manual Payment Gateway Demo (SPA)
          </h1>
          <p className="text-black">
            Status:{" "}
            {isAuthenticated ? (
              <span className="font-semibold text-green-600">
                Storefront successfully authenticated
              </span>
            ) : (
              <span className="font-semibold text-red-600">
                Storefront not authenticated
              </span>
            )}
          </p>

          {/* Cart ID Display */}
          <div className="flex items-center mt-2 text-sm text-gray-600">
            Cart ID:{" "}
            <span className="font-mono text-xs ml-1">
              {cartId || "No cart initialized"}
            </span>
          </div>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Step indicator */}
          <div className="flex items-center space-x-4 mb-8">
            <div
              className={`flex items-center space-x-2 ${
                currentStep === "create"
                  ? "text-blue-600"
                  : currentStep === "payment" || currentStep === "complete"
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  currentStep === "create"
                    ? "border-blue-600 bg-blue-100"
                    : currentStep === "payment" || currentStep === "complete"
                    ? "border-green-600 bg-green-100"
                    : "border-gray-300"
                }`}
              >
                1
              </div>
              <span className="font-medium">Create Order</span>
            </div>

            <div
              className={`w-8 h-0.5 ${
                currentStep === "payment" || currentStep === "complete"
                  ? "bg-green-600"
                  : "bg-gray-300"
              }`}
            ></div>

            <div
              className={`flex items-center space-x-2 ${
                currentStep === "payment"
                  ? "text-blue-600"
                  : currentStep === "complete"
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  currentStep === "payment"
                    ? "border-blue-600 bg-blue-100"
                    : currentStep === "complete"
                    ? "border-green-600 bg-green-100"
                    : "border-gray-300"
                }`}
              >
                2
              </div>
              <span className="font-medium">Process Payment</span>
            </div>

            <div
              className={`w-8 h-0.5 ${
                currentStep === "complete" ? "bg-green-600" : "bg-gray-300"
              }`}
            ></div>

            <div
              className={`flex items-center space-x-2 ${
                currentStep === "complete" ? "text-green-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  currentStep === "complete"
                    ? "border-green-600 bg-green-100"
                    : "border-gray-300"
                }`}
              >
                3
              </div>
              <span className="font-medium">Order Complete</span>
            </div>
          </div>

          {/* Content based on current step */}
          {currentStep === "create" && (
            <OrderCreator
              onCreateOrder={createIncompleteOrder}
              loading={loading}
              isAuthenticated={isAuthenticated}
            />
          )}

          {currentStep === "payment" && order && (
            <div className="space-y-6">
              <OrderStatus order={order} />
              <ManualPayment
                order={order}
                onPaymentComplete={handlePaymentComplete}
                onError={setError}
              />
            </div>
          )}

          {currentStep === "complete" && order && (
            <div className="space-y-6">
              <OrderStatus order={order} />
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-600 text-lg font-semibold mb-2">
                  🎉 Payment Complete!
                </div>
                <p className="text-green-700 mb-4">
                  The order has been marked as paid and is now complete.
                </p>
                <button
                  onClick={resetFlow}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-200"
                >
                  Process Another Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
