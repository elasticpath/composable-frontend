import { useCallback, useContext } from "react"
import { SimpleProductContext } from "@lib/product/simple/simple-provider"
import { VariationProductContext } from "@lib/product/variation/variation-provider"
import { OptionDict } from "@lib/product"

export function useVariationProduct() {
  const ctx = useContext(VariationProductContext)

  if (!ctx) {
    throw new Error(
      "Variation Product Context was unexpectedly null, make sure you are using the useVariationProduct hook inside a VariationProductProvider!"
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
    [setSelectedOptions, selectedOptions]
  )

  const getSelectedOption = useCallback(
    (variationId: string): string => {
      return selectedOptions[variationId]
    },
    [selectedOptions]
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
