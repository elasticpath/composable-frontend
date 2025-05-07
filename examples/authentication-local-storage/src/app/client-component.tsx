"use client"

import { useEffect, useState } from "react"
import {
  AccessTokenResponse,
  client,
  getByContextAllProducts,
  ProductListData,
} from "@epcc-sdk/sdks-shopper"
import { CREDENTIALS_COOKIE_KEY } from "./constants"

client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL!,
})

client.interceptors.request.use((request, options) => {
  const credentials = JSON.parse(
    localStorage.getItem(CREDENTIALS_COOKIE_KEY) ?? "{}",
  ) as AccessTokenResponse | undefined
  if (credentials) {
    request.headers.set("Authorization", `Bearer ${credentials.access_token}`)
  }
  return request
})

export function ClientComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [products, setProducts] = useState<ProductListData["data"]>([])

  useEffect(() => {
    // fetch products using sdk
    const fetchProducts = async () => {
      console.log("fetching products")
      const response = await getByContextAllProducts()
      setProducts(response.data?.data || [])
      console.log("response", response)

      setIsAuthenticated(
        (response.data?.data && response.data.data.length > 0) || false,
      )
    }
    fetchProducts()
  }, [])

  return (
    <>
      <div className="mb-6 border-b border-gray-300 pb-3">
        <h1 className="text-xl font-medium mb-2 text-black">
          Authentication Demo
        </h1>
        <p className="text-black">
          Status:{" "}
          {isAuthenticated ? (
            <span className="font-semibold text-green-800">
              Store successfully authenticated
            </span>
          ) : (
            <span className="font-semibold text-red-800">
              Not authenticated
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
