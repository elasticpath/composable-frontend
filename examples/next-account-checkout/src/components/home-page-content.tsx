"use client"

import { useState } from "react"
import { Product } from "@epcc-sdk/sdks-shopper"
import { ProductGrid } from "./product-grid"
import { CartCheckoutWrapper } from "./cart-checkout-wrapper"

interface HomePageContentProps {
  products: Product[]
  isUserAuthenticated: boolean
}

export function HomePageContent({
  products,
  isUserAuthenticated,
}: HomePageContentProps) {
  const [addToCartError, setAddToCartError] = useState<string | null>(null)

  return (
    <>
      {addToCartError && (
        <div className="my-4 text-sm text-red-600 first-letter:uppercase">
          {addToCartError}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <h2 className="text-lg font-medium mb-3 text-black">Product List</h2>
          {products?.length === 0 ? (
            <p className="text-black">No products found.</p>
          ) : (
            <ProductGrid
              products={products}
              onAddToCartError={setAddToCartError}
            />
          )}
        </div>

        <div className="lg:w-1/3 border-t lg:border-t-0 lg:border-l border-gray-300 pt-4 lg:pt-0 lg:pl-6">
          <CartCheckoutWrapper isUserAuthenticated={isUserAuthenticated} />
        </div>
      </div>
    </>
  )
}
