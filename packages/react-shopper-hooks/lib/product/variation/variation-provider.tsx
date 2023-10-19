import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react"
import type {
  CatalogsProductVariation,
  Moltin as EpccClient,
} from "@moltin/sdk"
import type {
  OptionDict,
  VariationProduct,
  MatrixObjectEntry,
} from "@elasticpath/shopper-common"
import { getOptionsFromProductId } from "@lib/product/variation/util/get-options-from-product-id"
import { mapOptionsToVariation } from "@lib/product/variation/util/map-options-to-variations"
import { createEmptyOptionDict } from "@lib/product/variation/util/create-empty-options-dict"
import { useStore } from "@lib/store"

interface VariationProductState {
  product: VariationProduct
  setProduct: Dispatch<SetStateAction<VariationProduct>>
  variationsMatrix: MatrixObjectEntry
  variations: CatalogsProductVariation[]
  client: EpccClient
  isBaseProduct: boolean
  setIsBaseProduct: Dispatch<SetStateAction<boolean>>
  selectedOptions: OptionDict
  setSelectedOptions: Dispatch<SetStateAction<OptionDict>>
}

export const VariationProductContext =
  createContext<VariationProductState | null>(null)

export function VariationProductProvider({
  children,
  variationProduct,
  client: overrideClient,
}: {
  variationProduct: VariationProduct
  children: ReactNode
  client?: EpccClient
}) {
  const { client } = useStore()

  const [product, setProduct] = useState<VariationProduct>(variationProduct)

  const [isBaseProduct, setIsBaseProduct] = useState<boolean>(
    variationProduct.kind === "base-product",
  )
  const [selectedOptions, setSelectedOptions] = useState<OptionDict>(
    resolveInitialSelectedOptions(
      product,
      product.variations,
      product.variationsMatrix,
    ),
  )

  return (
    <VariationProductContext.Provider
      value={{
        product,
        setProduct,
        variations: product.variations,
        variationsMatrix: product.variationsMatrix,
        client: overrideClient ?? client,
        isBaseProduct,
        setIsBaseProduct,
        selectedOptions,
        setSelectedOptions,
      }}
    >
      {children}
    </VariationProductContext.Provider>
  )
}

function resolveInitialSelectedOptions(
  product: VariationProduct,
  variations: CatalogsProductVariation[],
  variationsMatrix: MatrixObjectEntry,
) {
  const currentSkuOptions = getOptionsFromProductId(
    product.response.id,
    variationsMatrix,
  )

  return currentSkuOptions
    ? mapOptionsToVariation(currentSkuOptions, variations)
    : createEmptyOptionDict(variations)
}
