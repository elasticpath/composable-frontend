import React from "react"
import { useCart } from "@lib/cart"

export default function CartExample(): JSX.Element {
  const { state } = useCart()
  return <pre>{JSON.stringify(state)}</pre>
}
