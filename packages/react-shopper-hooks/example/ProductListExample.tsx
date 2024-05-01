import React from "react"
import { useProducts } from "../src"

export function ProductListExample() {
  const { data: products } = useProducts()
  return (
    <div>
      <h1>Product List</h1>
      {products?.data.map((product) => (
        <div key={product.id}>
          <h2>{product.attributes.name}</h2>
          <p>{product.id}</p>
        </div>
      ))}
    </div>
  )
}
