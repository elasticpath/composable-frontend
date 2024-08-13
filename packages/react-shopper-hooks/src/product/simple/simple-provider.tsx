import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react"
import type { ElasticPath } from "@elasticpath/js-sdk"
import { SimpleProduct } from "@elasticpath/shopper-common"
import { useStore } from "../../store"
import { ProductProviderOptions } from "../product-provider-options"

interface SimpleProductState {
  product: SimpleProduct
  setProduct: Dispatch<SetStateAction<SimpleProduct>>
  client: ElasticPath
}

export const SimpleProductContext = createContext<SimpleProductState | null>(
  null,
)

export function SimpleProductProvider({
  children,
  simpleProduct,
  client: overrideClient,
  options,
}: {
  simpleProduct: SimpleProduct
  children: ReactNode
  client?: ElasticPath
  options?: ProductProviderOptions
}) {
  const { client } = useStore()
  const [product, setProduct] = useState<SimpleProduct>(simpleProduct)

  // Update the product state whenever simpleProduct prop changes
  useEffect(() => {
    if (options?.dynamicUpdates) {
      setProduct(simpleProduct)
    }
  }, [simpleProduct])

  return (
    <SimpleProductContext.Provider
      value={{
        product,
        setProduct,
        client: overrideClient ?? client,
      }}
    >
      {children}
    </SimpleProductContext.Provider>
  )
}
