import React, {
  BaseProduct,
  MatrixObjectEntry,
} from "@elasticpath/shopper-common"
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react"
import { CatalogsProductVariation, ElasticPath } from "@elasticpath/js-sdk"
import { ProductProviderOptions } from "../product-provider-options"

interface BaseProductState {
  product: BaseProduct
  setProduct: Dispatch<SetStateAction<BaseProduct>>
  variationsMatrix: MatrixObjectEntry
  variations: CatalogsProductVariation[]
  client: ElasticPath
}

export const BaseProductContext = createContext<BaseProductState | null>(null)

export function BaseProductProvider({
  children,
  baseProduct,
  client,
  options,
}: {
  baseProduct: BaseProduct
  children: ReactNode
  client: ElasticPath
  options?: ProductProviderOptions
}) {
  const [product, setProduct] = useState<BaseProduct>(baseProduct)

  useEffect(() => {
    if (options?.dynamicUpdates) {
      setProduct(baseProduct)
    }
  }, [baseProduct])

  return (
    <BaseProductContext.Provider
      value={{
        product,
        setProduct,
        variations: product.variations,
        variationsMatrix: product.variationsMatrix,
        client,
      }}
    >
      {children}
    </BaseProductContext.Provider>
  )
}
