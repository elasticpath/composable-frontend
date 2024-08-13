import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react"
import type { CatalogsProductVariation, ElasticPath } from "@elasticpath/js-sdk"
import type {
  OptionDict,
  VariationProduct,
  MatrixObjectEntry,
} from "@elasticpath/shopper-common"
import { getOptionsFromProductId } from "../../product/variation/util/get-options-from-product-id"
import { mapOptionsToVariation } from "../../product/variation/util/map-options-to-variations"
import { createEmptyOptionDict } from "../../product/variation/util/create-empty-options-dict"
import { useStore } from "../../store"
import { ProductProviderOptions } from "../product-provider-options"

interface VariationProductState {
  product: VariationProduct
  setProduct: Dispatch<SetStateAction<VariationProduct>>
  variationsMatrix: MatrixObjectEntry
  variations: CatalogsProductVariation[]
  client: ElasticPath
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
  options,
}: {
  variationProduct: VariationProduct
  children: ReactNode
  client?: ElasticPath
  options?: ProductProviderOptions
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

  useEffect(() => {
    if (options?.dynamicUpdates) {
      setProduct(variationProduct)
    }
  }, [variationProduct])

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
