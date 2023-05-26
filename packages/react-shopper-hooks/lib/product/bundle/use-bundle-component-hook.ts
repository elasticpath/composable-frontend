import { useCallback, useContext, useMemo } from "react"
import {
  BundleConfigurationSelectedOptions,
  BundleProductContext,
} from "@lib/product"
import { isSelectedOption as _isSelectedOption } from "@lib/product/bundle/util/is-selected-option"

export function useBundleComponent(componentKey: string) {
  const ctx = useContext(BundleProductContext)

  if (!ctx) {
    throw new Error(
      "Product Component Context was unexpectedly null, make sure you are using the useBundleComponent hook inside a BundleProductProvider!"
    )
  }

  const { setSelectedOptions, components, selectedOptions } = ctx

  const selected = selectedOptions[componentKey]

  const updateSelectedOptions = useCallback(
    async (selected: BundleConfigurationSelectedOptions[0]) => {
      setSelectedOptions((prevState) => ({
        ...prevState,
        [componentKey]: selected,
      }))
    },
    [setSelectedOptions, selected]
  )

  const component = useMemo(() => {
    return components[componentKey]
  }, [components])

  const isSelectedOption = useCallback(_isSelectedOption(selected), [selected])

  return {
    component,
    updateSelectedOptions,
    selected,
    isSelectedOption,
  }
}
