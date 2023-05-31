import { useContext } from "react"
import { SimpleProductContext } from "@lib/product/simple/simple-provider"

export function useSimpleProduct() {
  const ctx = useContext(SimpleProductContext)

  if (!ctx) {
    throw new Error(
      "Simple Product Context was unexpectedly null, make sure you are using the useSimpleProduct hook inside a SimpleProductContext!"
    )
  }

  const { product } = ctx

  return {
    product,
  }
}
