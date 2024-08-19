"use client"

import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react"
import {
  BundleComponents,
  BundleConfiguration,
  BundleConfigurationSelectedOptions,
  ComponentProduct,
  BundleProduct,
  configureBundle as _configureBundle,
  createBundleConfigureValidator,
} from "@elasticpath/shopper-common"
import type { ElasticPath, ProductResponse, File } from "@elasticpath/js-sdk"
import { useStore } from "../../store"
import { ProductProviderOptions } from "../product-provider-options"

interface BundleProductState {
  configuredProduct: BundleProduct
  setConfiguredProduct: Dispatch<SetStateAction<BundleProduct>>
  components: BundleComponents
  setComponents: Dispatch<SetStateAction<BundleComponents>>
  componentProducts: ProductResponse[]
  setComponentProducts: Dispatch<SetStateAction<ComponentProduct[]>>
  componentProductImages: File[]
  setComponentProductImages: Dispatch<SetStateAction<File[]>>
  bundleConfiguration: BundleConfiguration
  setBundleConfiguration: Dispatch<SetStateAction<BundleConfiguration>>
  selectedOptions: BundleConfigurationSelectedOptions
  setSelectedOptions: Dispatch<
    SetStateAction<BundleConfigurationSelectedOptions>
  >
  client: ElasticPath
}

export const BundleProductContext = createContext<BundleProductState | null>(
  null,
)

export function BundleProductProvider({
  children,
  bundleProduct,
  client: overrideClient,
  options,
}: {
  bundleProduct: BundleProduct
  children: ReactNode
  client?: ElasticPath
  options?: ProductProviderOptions
}) {
  const { client: storeClient } = useStore()

  const [client] = useState(overrideClient ?? storeClient)

  const [configuredProduct, setConfiguredProduct] =
    useState<BundleProduct>(bundleProduct)

  useEffect(() => {
    if (options?.dynamicUpdates) {
      setConfiguredProduct(configuredProduct)
    }
  }, [configuredProduct])

  const {
    componentProductResponses,
    response: {
      attributes: { components: srcComponents },
      meta: { bundle_configuration: initBundleConfiguration },
    },
    componentProductImages: srcComponentProductImages,
  } = configuredProduct

  if (!initBundleConfiguration) {
    throw new Error(
      "bundle_configuration on bundle product was unexpectedly undefined!",
    )
  }

  const [components, setComponents] = useState<BundleComponents>(srcComponents)
  const [bundleConfiguration, setBundleConfiguration] =
    useState<BundleConfiguration>(initBundleConfiguration)
  const [componentProducts, setComponentProducts] = useState<
    ComponentProduct[]
  >(componentProductResponses)

  const [componentProductImages, setComponentProductImages] = useState<File[]>(
    srcComponentProductImages,
  )

  const validator = useCallback(createBundleConfigureValidator(srcComponents), [
    components,
  ])

  const [selectedOptions, setSelectedOptions] =
    useState<BundleConfigurationSelectedOptions>(
      initBundleConfiguration.selected_options,
    )

  const configureBundle = useCallback(
    async (selectedOptions: BundleConfigurationSelectedOptions) => {
      const { success: isValid } = validator(selectedOptions)

      if (isValid) {
        const updatedBundleProduct = await _configureBundle(
          configuredProduct.response.id,
          selectedOptions,
          client,
        )
        setConfiguredProduct((prevState) => ({
          ...prevState,
          response: updatedBundleProduct,
        }))
      }
    },
    [configuredProduct, setConfiguredProduct, validator, client],
  )

  // Sync the configured product details when selected options change
  useEffect(() => {
    configureBundle(selectedOptions)
  }, [selectedOptions])

  return (
    <BundleProductContext.Provider
      value={{
        setComponentProductImages,
        componentProductImages,
        client,
        configuredProduct,
        setConfiguredProduct,
        components,
        setComponents,
        bundleConfiguration,
        setBundleConfiguration,
        componentProducts,
        setComponentProducts,
        selectedOptions,
        setSelectedOptions,
      }}
    >
      {children}
    </BundleProductContext.Provider>
  )
}
