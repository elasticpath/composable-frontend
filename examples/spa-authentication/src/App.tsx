import { useEffect, useState } from "react"
import "./App.css"
import {
  getByContextAllProducts,
  ProductListData,
} from "@epcc-sdk/sdks-shopper"

function App() {
  const [products, setProducts] = useState<ProductListData["data"]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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

  return (
    <>
      <div className="mb-6 border-b border-gray-300 pb-3">
        <h1 className="text-xl font-medium mb-2 text-black">
          Storefront Authentication Demo (SPA)
        </h1>
        <p className="text-black">
          Status:{" "}
          {isAuthenticated ? (
            <span className="font-semibold text-green-800">
              Storefront successfully authenticated
            </span>
          ) : (
            <span className="font-semibold text-red-800">
              Storefront not authenticated
            </span>
          )}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3 text-black">Product List</h2>
        {products?.length === 0 ? (
          <p className="text-black">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products?.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
              >
                <div
                  className="text-base text-black font-semibold mb-1 truncate"
                  title={product.attributes?.name}
                >
                  {product.attributes?.name}
                </div>
                <div className="text-sm text-gray-600">
                  SKU: {product.attributes?.sku}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default App
