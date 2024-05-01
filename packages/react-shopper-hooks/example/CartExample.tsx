import React from "react"
import { useCart, useCartAddBundleItem, useCartClear } from "../src/cart"

export default function CartExample(): JSX.Element {
  const { state } = useCart()
  const { mutate: addBundleProductToCart } = useCartAddBundleItem()
  const { mutate: emptyCart } = useCartClear()
  return (
    <>
      <button onClick={() => emptyCart()}>Empty Cart</button>
      <button
        onClick={() =>
          addBundleProductToCart({
            productId: "14edd744-c615-4a33-a2c2-df999bbb5103",
            quantity: 1,
            selectedOptions: {
              plants: {
                "a158ffa0-5d16-4325-8dcc-be8acd55eecf": 1,
              },
              pots: {
                "fc520b37-a709-4032-99b3-8d4ecc990027": 1,
              },
              tools: {
                "7ffe107d-c5bd-4de4-b8f0-a58d90cb3cd3": 1,
              },
            },
          })
        }
      >
        Add bundle to cart
      </button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </>
  )
}
