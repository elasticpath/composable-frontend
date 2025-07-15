"use client"

import { useState } from "react"
import { Product } from "@epcc-sdk/sdks-shopper"
import { useCart } from "./cart-provider"
import { Button } from "./ui"
import { addToCart as addToCartAction } from "../app/actions"

interface ProductGridProps {
  products: Product[]
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

export function ProductGrid({ products }: ProductGridProps) {
  const { cartId, refreshCart } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState<Record<string, boolean>>(
    {},
  )
  const [addToCartError, setAddToCartError] = useState<string | null>(null)

  const addToCart = async (productId: string) => {
    if (!cartId) {
      setAddToCartError("Cart not initialized. Please refresh the page.")
      return
    }

    try {
      setIsAddingToCart((prev) => ({ ...prev, [productId]: true }))
      setAddToCartError(null)

      const result = await addToCartAction(productId, cartId)

      if (result.error) {
        throw new Error(result.error)
      }

      refreshCart()
    } catch (error) {
      const errorMessage = deriveAddToCartErrorMessage(error)
      console.error("Failed to add to cart:", errorMessage)
      setAddToCartError(errorMessage)
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [productId]: false }))
    }
  }

  if (products.length === 0) {
    return <p className="text-black">No products found.</p>
  }

  return (
    <div>
      {addToCartError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-600 first-letter:uppercase">
            {addToCartError}
          </div>
        </div>
      )}

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
            <Button
              onClick={() => product.id && addToCart(product.id)}
              disabled={
                !cartId || (product.id ? !!isAddingToCart[product.id] : true)
              }
              className="w-full mt-2"
              size="small"
            >
              {product.id && isAddingToCart[product.id]
                ? "Adding..."
                : "Add to Cart"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
