import { useCallback, useContext } from "react"
import { BundleConfigurationSelectedOptions } from "@lib/product/bundle/bundle.types"
import { BundleProductContext } from "@lib/product/bundle/bundle-provider"

export function useBundle() {
  const ctx = useContext(BundleProductContext)

  if (!ctx) {
    throw new Error(
      "Product Component Context was unexpectedly null, make sure you are using the useComponents hook inside a BundleProductProvider!"
    )
  }

  const {
    setComponents,
    components,
    bundleConfiguration,
    setBundleConfiguration,
    componentProducts,
    selectedOptions,
    configuredProduct,
    setSelectedOptions,
  } = ctx

  const updateSelectedOptions = useCallback(
    (selectedOptions: BundleConfigurationSelectedOptions) => {
      setSelectedOptions(selectedOptions)
    },
    [setSelectedOptions]
  )

  return {
    setComponents,
    components,
    bundleConfiguration,
    setBundleConfiguration,
    componentProducts,
    selectedOptions,
    configuredProduct,
    updateSelectedOptions,
  }
}
