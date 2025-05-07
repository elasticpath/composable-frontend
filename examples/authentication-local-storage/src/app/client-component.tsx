"use client"

import { useEffect, useState } from "react"
import {
  getByContextAllProducts,
  ProductListData,
} from "@epcc-sdk/sdks-shopper"

export function ClientComponent() {
  const [products, setProducts] = useState<ProductListData["data"]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchProducts = async () => {
    const response = await getByContextAllProducts()
    setProducts(response.data?.data || [])
    if (response.data?.data && response.data?.data.length > 0) {
      setIsAuthenticated(true)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // fetch products using sdk

  return (
    <>
      <div className="mb-6 border-b border-gray-300 pb-3">
        <h1 className="text-xl font-medium mb-2 text-black">
          Storefront Authentication Demo
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
          <ul className="space-y-3">
            {products?.map((product) => (
              <li key={product.id} className="border-b border-gray-300 pb-3">
                <div className="text-base text-black font-medium">
                  {product.attributes?.name}
                </div>
                <div className="text-sm text-black">
                  SKU: {product.attributes?.sku}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
