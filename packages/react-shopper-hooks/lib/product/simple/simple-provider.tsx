import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react"
import type { Moltin as EpccClient } from "@moltin/sdk"
import { SimpleProduct } from "@lib/product"

interface SimpleProductState {
  product: SimpleProduct
  setProduct: Dispatch<SetStateAction<SimpleProduct>>
  client: EpccClient
}

export const SimpleProductContext = createContext<SimpleProductState | null>(
  null
)

export function SimpleProductProvider({
  children,
  simpleProduct,
  client,
}: {
  simpleProduct: SimpleProduct
  children: ReactNode
  client: EpccClient
}) {
  const [product, setProduct] = useState<SimpleProduct>(simpleProduct)

  return (
    <SimpleProductContext.Provider
      value={{
        product,
        setProduct,
        client,
      }}
    >
      {children}
    </SimpleProductContext.Provider>
  )
}
