import { useEffect, useState } from "react"
import {
  getByContextAllProducts,
  manageCarts,
  type ProductListData,
} from "@epcc-sdk/sdks-shopper"
import { CartView } from "./components/CartView"
import { CART_COOKIE_KEY } from "./constants"

function App() {
  const [products, setProducts] = useState<ProductListData["data"]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState<Record<string, boolean>>(
    {},
  )
  const [addToCartError, setAddToCartError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      const response = await getByContextAllProducts()
      setProducts(response.data?.data || [])
      if (response.data?.data && response.data?.data.length > 0) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const addToCart = async (productId: string) => {
    try {
      setIsAddingToCart((prev) => ({ ...prev, [productId]: true }))
      setAddToCartError(null)

      const cartId = localStorage.getItem(CART_COOKIE_KEY)
      if (!cartId) {
        throw new Error("No cart found. Please refresh the page.")
      }

      await manageCarts({
        path: {
          cartID: cartId,
        },
        body: {
          data: {
            type: "cart_item",
            id: productId,
            quantity: 1,
          },
        },
      })

      window.dispatchEvent(new Event("cart:updated"))
    } catch (error) {
      console.error("Failed to add to cart:", error)
      setAddToCartError(
        error instanceof Error
          ? error.message
          : "Failed to add product to cart",
      )
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [productId]: false }))
    }
  }

  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6 border-b border-gray-300 pb-3">
          <h1 className="text-xl font-medium mb-2 text-black">
            Storefront Authentication Demo (SPA)
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
          {addToCartError && (
            <div className="mt-2 text-sm text-red-600">{addToCartError}</div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <h2 className="text-lg font-medium mb-3 text-black">
              Product List
            </h2>
            {products?.length === 0 ? (
              <p className="text-black">No products found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products?.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:shadow transition-shadow duration-200"
                  >
                    <div
                      className="text-base text-black font-semibold mb-1 truncate"
                      title={product.attributes?.name}
                    >
                      {product.attributes?.name}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      SKU: {product.attributes?.sku}
                    </div>
                    <button
                      onClick={() => product.id && addToCart(product.id)}
                      disabled={
                        product.id ? !!isAddingToCart[product.id] : true
                      }
                      className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {product.id && isAddingToCart[product.id]
                        ? "Adding..."
                        : "Add to Cart"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-1/3 border-t lg:border-t-0 lg:border-l border-gray-300 pt-4 lg:pt-0 lg:pl-6">
            <CartView />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
