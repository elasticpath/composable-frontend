import React, { Dispatch, SetStateAction, useCallback, useContext } from "react"
import { BundleProductContext } from "../../product/bundle/bundle-provider"
import {
  BundleConfiguration,
  BundleConfigurationSelectedOptions,
  BundleProduct,
} from "@elasticpath/shopper-common"
import { ProductResponse, File, ProductComponents } from "@moltin/sdk"

export function useBundle(): {
  setComponents: Dispatch<SetStateAction<ProductComponents>>
  components: ProductComponents
  bundleConfiguration: BundleConfiguration
  setBundleConfiguration: (bundleConfiguration: BundleConfiguration) => void
  componentProducts: ProductResponse[]
  selectedOptions: BundleConfigurationSelectedOptions
  configuredProduct: BundleProduct
  updateSelectedOptions: (
    selectedOptions: BundleConfigurationSelectedOptions,
  ) => void
  componentProductImages: File[]
} {
  const ctx = useContext(BundleProductContext)

  if (!ctx) {
    throw new Error(
      "Product Component Context was unexpectedly null, make sure you are using the useComponents hook inside a BundleProductProvider!",
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
    componentProductImages,
  } = ctx

  const updateSelectedOptions = useCallback(
    (selectedOptions: BundleConfigurationSelectedOptions) => {
      setSelectedOptions(selectedOptions)
    },
    [setSelectedOptions],
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
    componentProductImages,
  }
}
