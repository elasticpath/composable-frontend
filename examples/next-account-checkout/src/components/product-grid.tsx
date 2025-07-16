"use client"

import { Product } from "@epcc-sdk/sdks-shopper"
import { addToCart as addToCartAction } from "../app/actions"
import { useCart } from "./cart-provider"
import { useState } from "react"

interface ProductGridProps {
  products: Product[]
  onAddToCartError?: (error: string | null) => void
}

function deriveAddToCartErrorMessage(error: any) {
  if (error instanceof Error) {
    return error.message
  } else if (typeof error === "string") {
    return error
  } else {
    return "Failed to add product to cart"
  }
}

export function ProductGrid({ products, onAddToCartError }: ProductGridProps) {
  const { cartId } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState<Record<string, boolean>>(
    {},
  )

  const addToCart = async (productId: string) => {
    if (!cartId) {
      const errorMessage = "Cart not initialized. Please refresh the page."
      onAddToCartError?.(errorMessage)
      return
    }

    try {
      setIsAddingToCart((prev) => ({ ...prev, [productId]: true }))
      onAddToCartError?.(null)

      const result = await addToCartAction(productId, cartId)

      if (result.error) {
        throw new Error(result.error)
      }

      window.dispatchEvent(new Event("cart:updated"))
    } catch (error) {
      const errorMessage = deriveAddToCartErrorMessage(error)
      console.error("Failed to add to cart:", errorMessage)
      onAddToCartError?.(errorMessage)
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [productId]: false }))
    }
  }

  if (products.length === 0) {
    return <p className="text-black">No products found.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
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
            disabled={product.id ? !!isAddingToCart[product.id] : true}
            className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {product.id && isAddingToCart[product.id]
              ? "Adding..."
              : "Add to Cart"}
          </button>
        </div>
      ))}
    </div>
  )
}
