import { useState, useCallback } from "react"
import {
  configureByContextProduct,
  type BundleConfiguration,
  type ProductData,
} from "@epcc-sdk/sdks-shopper"
import { client } from "../../../lib/client-sdk"

export function useBundlePriceUpdate(
  productId: string,
  onComplete?: (product: ProductData | null, error: string | null) => void,
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configuredProduct, setConfiguredProduct] =
    useState<ProductData | null>(null)

  const updatePrice = useCallback(
    async (bundleConfiguration: BundleConfiguration) => {
      setIsLoading(true)
      setError(null)
      setConfiguredProduct(null)

      try {
        // Convert BigInt values to numbers for the API
        const convertedOptions: BundleConfiguration["selected_options"] = {}

        for (const [componentKey, options] of Object.entries(
          bundleConfiguration.selected_options,
        )) {
          convertedOptions[componentKey] = {}
          for (const [optionId, quantity] of Object.entries(options)) {
            convertedOptions[componentKey][optionId] = Number(quantity)
          }
        }

        const response = await configureByContextProduct({
          client,
          query: {
            include: ["main_image", "files", "component_products"],
          },
          path: { product_id: productId },
          body: {
            data: {
              selected_options: convertedOptions,
            },
          },
        })

        if (response.data?.data) {
          setConfiguredProduct(response.data)
          if (onComplete) {
            onComplete(response.data, null)
          }
        } else {
          if (onComplete) {
            onComplete(null, "No data in response")
          }
        }
      } catch (err) {
        console.error("Failed to update bundle price:", err)
        const errorMsg = "Failed to update price"
        setError(errorMsg)
        if (onComplete) {
          onComplete(null, errorMsg)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [productId, onComplete],
  )

  return {
    updatePrice,
    isLoading,
    error,
    configuredProduct,
  }
}
