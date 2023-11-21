import React, {
  BaseProduct,
  MatrixObjectEntry,
} from "@elasticpath/shopper-common"
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react"
import { CatalogsProductVariation, Moltin as EpccClient } from "@moltin/sdk"

interface BaseProductState {
  product: BaseProduct
  setProduct: Dispatch<SetStateAction<BaseProduct>>
  variationsMatrix: MatrixObjectEntry
  variations: CatalogsProductVariation[]
  client: EpccClient
}

export const BaseProductContext = createContext<BaseProductState | null>(null)

export function BaseProductProvider({
  children,
  baseProduct,
  client,
}: {
  baseProduct: BaseProduct
  children: ReactNode
  client: EpccClient
}) {
  const [product, setProduct] = useState<BaseProduct>(baseProduct)

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
