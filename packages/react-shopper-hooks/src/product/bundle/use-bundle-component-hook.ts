import { useCallback, useContext, useMemo } from "react"
import { BundleProductContext } from "../../product"
import { isSelectedOption as _isSelectedOption } from "../../product/bundle/util/is-selected-option"
import type { BundleConfigurationSelectedOptions } from "@elasticpath/shopper-common"
import { ProductComponents } from "@moltin/sdk"

export function useBundleComponent(componentKey: string): {
  selected: BundleConfigurationSelectedOptions[0]
  component: ProductComponents[0]
  updateSelectedOptions: (
    selected: BundleConfigurationSelectedOptions[0],
  ) => void
  isSelectedOption: (optionId: string) => boolean
} {
  const ctx = useContext(BundleProductContext)

  if (!ctx) {
    throw new Error(
      "Product Component Context was unexpectedly null, make sure you are using the useBundleComponent hook inside a BundleProductProvider!",
    )
  }

  const { setSelectedOptions, components, selectedOptions } = ctx

  const selected = selectedOptions[componentKey]

  const updateSelectedOptions = useCallback(
    async (selected: BundleConfigurationSelectedOptions[0]) => {
      setSelectedOptions((prevState: any) => ({
        ...prevState,
        [componentKey]: selected,
      }))
    },
    [setSelectedOptions, selected],
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
