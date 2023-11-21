import { useCallback, useContext } from "react"
import { VariationProductContext } from "../../product/variation/variation-provider"
import {
  VariationProduct,
  MatrixObjectEntry,
} from "@elasticpath/shopper-common"
import { CatalogsProductVariation } from "@moltin/sdk"

export function useVariationProduct(): {
  product: VariationProduct
  isBaseProduct: boolean
  variations: CatalogsProductVariation[]
  variationsMatrix: MatrixObjectEntry
  selectedOptions: Record<string, string>
  updateSelectedOptions: (variationId: string, optionId: string) => void
  getSelectedOption: (variationId: string) => string
} {
  const ctx = useContext(VariationProductContext)

  if (!ctx) {
    throw new Error(
      "Variation Product Context was unexpectedly null, make sure you are using the useVariationProduct hook inside a VariationProductProvider!",
    )
  }

  const {
    product,
    isBaseProduct,
    variations,
    variationsMatrix,
    selectedOptions,
    setSelectedOptions,
  } = ctx

  const updateSelectedOptions = useCallback(
    (variationId: string, optionId: string) => {
      for (const selectedOptionKey in selectedOptions) {
        if (selectedOptionKey === variationId) {
          setSelectedOptions({
            ...selectedOptions,
            [selectedOptionKey]: optionId,
          })
          break
        }
      }
    },
    [setSelectedOptions, selectedOptions],
  )

  const getSelectedOption = useCallback(
    (variationId: string): string => {
      return selectedOptions[variationId]
    },
    [selectedOptions],
  )

  return {
    product,
    isBaseProduct,
    variations,
    variationsMatrix,
    selectedOptions,
    updateSelectedOptions,
    getSelectedOption,
  }
}
