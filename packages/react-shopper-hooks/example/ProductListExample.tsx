import React from "react"
import { useProductsEnhanced } from "../src/product/hooks/use-products-enhanced"

export function ProductListExample() {
  const { data: products } = useProductsEnhanced()
  return (
    <div>
      <h1>Product List</h1>
      {products?.data.map((product) => (
        <div key={product.id}>
          <h2>{product.attributes.name}</h2>
          <p>{product.id}</p>
          <p>Main image: {product.enhanced.mainImage?.link?.href}</p>
          <p>
            Other images:{" "}
            {product.enhanced.otherImages
              ?.map((x) => {
                return x.link.href
              })
              .toString()}
          </p>
        </div>
      ))}
    </div>
  )
}
