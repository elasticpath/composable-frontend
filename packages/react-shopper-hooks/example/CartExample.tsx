import React, { useEffect } from "react"
import {
  useCart,
  useCartAddBundleItem,
  useCartAddProduct,
  useCartAddPromotion,
  useCartClear,
} from "../src/cart"
import ReactJson from "react-json-view"
import { useEvent } from "../src/event"

export default function CartExample(): JSX.Element {
  const { data, isLoading } = useCart()
  const { mutate: addBundleProductToCart } = useCartAddBundleItem()
  const { mutate: addProduct } = useCartAddProduct()
  const { mutate: emptyCart } = useCartClear()
  const { mutate: addPromotion } = useCartAddPromotion()
  const { events } = useEvent()

  useEffect(() => {
    const sub = events.subscribe((event) => {
      console.log(event)
    })

    return () => sub.unsubscribe()
  }, [events])

  const itemDiscounts = data?.state.__extended.getItemDiscounts()
  const allDiscounts = data?.state.__extended.getAllDiscounts()

  return (
    <>
      <button onClick={() => emptyCart()}>Empty Cart</button>
      <button
        onClick={() =>
          addPromotion({
            code: "ZOAGUO",
          })
        }
      >
        Add Promotion ZOAGUO
      </button>
      <button
        onClick={() =>
          addPromotion({
            code: "SH4IDX",
          })
        }
      >
        Add Promotion SH4IDX
      </button>
      <button
        onClick={() =>
          addProduct({
            productId: "1cc7f871-1071-4908-a79d-633adc56044a",
            quantity: 1,
          })
        }
      >
        Add Product
      </button>
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
      {data && (
        <div style={{ textAlign: "left", width: "100%" }}>
          <h3>Cart State</h3>
          <ReactJson src={data.state} theme="apathy" />
        </div>
      )}
      {itemDiscounts && (
        <div style={{ textAlign: "left", width: "100%" }}>
          <h3>Item Discounts</h3>
          <ReactJson src={itemDiscounts} theme="apathy" />
        </div>
      )}
      {allDiscounts && (
        <div style={{ textAlign: "left", width: "100%" }}>
          <h3>All discounts</h3>
          <ReactJson src={allDiscounts} theme="apathy" />
        </div>
      )}
    </>
  )
}
