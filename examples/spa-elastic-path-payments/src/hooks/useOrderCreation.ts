import { useState } from "react"
import {
  getByContextAllProducts,
  getCartId,
  manageCarts,
  checkoutApi,
  getStock,
  type OrderResponse,
} from "@epcc-sdk/sdks-shopper"

export function useOrderCreation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    } catch (error: any) {
      // Handle 404 and other errors gracefully - assume product is available
      console.warn(
        `Could not check stock for product ${productId}:`,
        error?.message || error,
      )
      return true // Default to assuming product is available if stock check fails
    }
  }

  const createIncompleteOrder = async (): Promise<OrderResponse | null> => {
    try {
      setLoading(true)
      setError(null)

      // Fetch products with better error handling
      let productsResponse
      try {
        productsResponse = await getByContextAllProducts()
      } catch (err: any) {
        throw new Error(
          `Failed to fetch products: ${
            err?.message ||
            "Please check your store configuration and ensure products exist."
          }`,
        )
      }

      const allProducts = productsResponse.data?.data || []

      if (allProducts.length === 0) {
        throw new Error(
          "No products available in your store. Please add products to your Elastic Path Commerce Cloud store first.",
        )
      }

      const addableProducts = allProducts.filter((product: any) => {
        if (product.relationships?.parent) {
          return true
        }
        if (product.attributes?.base_product) {
          return false
        }
        return true
      })

      if (addableProducts.length === 0) {
        throw new Error(
          "No products available that can be added to cart. All products are base products that require variant selection. Please add some simple products to your store.",
        )
      }

      let firstProduct = null
      for (const product of addableProducts) {
        if (!product.id) continue
        const hasStock = await checkProductStock(product.id)
        if (hasStock) {
          firstProduct = product
          break
        }
      }

      if (!firstProduct) {
        // If stock checking failed for all products, just use the first one
        firstProduct = addableProducts[0]
        console.warn(
          "Stock checking failed for all products, using first available product",
        )
      }

      const cartId = getCartId()
      if (!cartId) {
        throw new Error("No cart found. Please refresh the page.")
      }

      await manageCarts({
        path: { cartID: cartId },
        body: {
          data: {
            type: "cart_item",
            id: firstProduct.id,
            quantity: 1,
          },
        },
      })

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

      window.dispatchEvent(new Event("cart:updated"))
      return orderData
    } catch (err: any) {
      setError(err?.message || "Failed to create order")
      console.error("Order creation error:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createIncompleteOrder,
    loading,
    error,
    clearError: () => setError(null),
  }
}
