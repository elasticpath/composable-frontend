import { useCallback, useContext } from "react"
import { BundleConfigurationSelectedOptions } from "@lib/product/bundle/bundle.types"
import { isSelectedOption as _isSelectedOption } from "@lib/product/bundle/util/is-selected-option"
import { BundleProductContext } from "@lib/product/bundle/bundle-provider"

export function useComponentOptions(optionKey: string) {
  const ctx = useContext(BundleProductContext)

  if (!ctx) {
    throw new Error(
      "Product Component Context was unexpectedly null, make sure you are using the useComponentOption hook inside a BundleProductProvider!"
    )
  }

  const { setSelectedOptions, selectedOptions } = ctx

  const updateSelectedOptions = useCallback(
    async (selected: BundleConfigurationSelectedOptions[0]) => {
      setSelectedOptions((prevState) => ({
        ...prevState,
        [optionKey]: selected,
      }))
    },
    [setSelectedOptions]
  )
  const selected = selectedOptions[optionKey]

  const isSelectedOption = useCallback(_isSelectedOption(selected), [selected])

  return {
    updateSelectedOptions,
    selected,
    isSelectedOption,
  }
}
