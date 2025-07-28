import { useState, useCallback } from "react"
import {
  configureByContextProduct,
  type BundleConfiguration,
  type ProductData,
} from "@epcc-sdk/sdks-shopper"
import { client } from "../../../lib/client-sdk"

export function useBundlePriceUpdate(productId: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configuredProduct, setConfiguredProduct] =
    useState<ProductData | null>(null)

  const updatePrice = useCallback(
    async (bundleConfiguration: BundleConfiguration) => {
      setIsLoading(true)
      setError(null)

      try {
        // Convert BigInt values to numbers for the API
        const convertedOptions: BundleConfiguration["selected_options"] = {}

        for (const [componentKey, options] of Object.entries(
          bundleConfiguration.selected_options,
        )) {
          convertedOptions[componentKey] = {}
          for (const [optionId, quantity] of Object.entries(options)) {
            convertedOptions[optionId] = Number(quantity)
          }
        }

        const response = await configureByContextProduct({
          client,
          path: { product_id: productId },
          body: {
            data: {
              selected_options: convertedOptions,
            },
          },
        })

        if (response.data?.data) {
          setConfiguredProduct(response.data)
        }
      } catch (err) {
        console.error("Failed to update bundle price:", err)
        setError("Failed to update price")
      } finally {
        setIsLoading(false)
      }
    },
    [productId],
  )

  return {
    updatePrice: async (bundleConfiguration: BundleConfiguration) => {
      await updatePrice(bundleConfiguration)
      return { configuredProduct, error }
    },
    isLoading,
    error,
    configuredProduct,
  }
}
