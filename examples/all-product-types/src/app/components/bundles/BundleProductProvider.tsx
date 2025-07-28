"use client"
import {
  BundleConfiguration,
  Components,
  ElasticPathFile,
  Product,
  ProductData,
  StockResponse,
} from "@epcc-sdk/sdks-shopper"
import { createContext, ReactNode, type JSX, useContext, useMemo, useState, useCallback } from "react"
import {
  ShopperProductProvider,
  useCreateShopperProductContext,
} from "../useShopperProductContext"
import { BundleProductForm } from "./BundleProductForm"
import { useFormContext, useWatch } from "react-hook-form"
import { FormSelectedOptions } from "./form-parsers"

export interface BundleProductProvider {
  product: ProductData
  componentImageFiles: ElasticPathFile[]
  inventory?: StockResponse
  initialConfig?: string
  children: ReactNode
}

export interface BundleProductContextType {
  components: Components
  component_products: Product[]
  componentImageFiles: ElasticPathFile[]
  isPriceUpdating?: boolean
  updateBundlePrice?: (product: ProductData) => void
}

export const BundleProductContext =
  createContext<BundleProductContextType | null>(null)

export function BundleProductProvider({
  inventory,
  componentImageFiles: sourceComponentImageFiles,
  product: sourceProduct,
  initialConfig,
  children,
}: BundleProductProvider): JSX.Element {
  const [isPriceUpdating, setIsPriceUpdating] = useState(false)
  const [dynamicProduct, setDynamicProduct] = useState<ProductData | null>(null)
  
  // If we have an initial config, decode it and apply it to the product
  const initialProduct = useMemo(() => {
    if (!initialConfig) return sourceProduct

    try {
      // Decode base64 - this can fail if the string is malformed
      let decodedString: string
      try {
        decodedString = atob(initialConfig)
      } catch (e) {
        console.warn("Invalid base64 config parameter:", e)
        return sourceProduct
      }

      // Parse JSON - this can fail if the JSON is malformed
      const decodedConfig = JSON.parse(decodedString)
      if (typeof decodedConfig === "object" && decodedConfig !== null) {
        // The decoded config is in form format (FormSelectedOptions)
        // We need to convert it to the API format for selected_options
        const selectedOptions: BundleConfiguration["selected_options"] = {}

        for (const [componentKey, formOptions] of Object.entries(
          decodedConfig,
        )) {
          if (Array.isArray(formOptions)) {
            // Each formOption is a stringified JSON object like {"optionId": quantity}
            selectedOptions[componentKey] = {}

            for (const optionStr of formOptions as string[]) {
              try {
                const parsed = JSON.parse(optionStr)
                // Convert number values to BigInt as expected by the API
                const convertedOption: Record<string, bigint> = {}
                for (const [optionId, quantity] of Object.entries(parsed)) {
                  convertedOption[optionId] = BigInt(quantity as number)
                }
                Object.assign(selectedOptions[componentKey], convertedOption)
              } catch (e) {
                console.warn("Invalid option string:", optionStr, e)
              }
            }
          }
        }

        // Create a new product with the decoded configuration
        const updatedProduct = {
          ...sourceProduct,
          data: {
            ...sourceProduct.data,
            meta: {
              ...sourceProduct.data?.meta,
              bundle_configuration: {
                ...sourceProduct.data?.meta?.bundle_configuration,
                selected_options: selectedOptions,
              },
            },
          },
        } as ProductData

        return updatedProduct
      }
    } catch (e) {
      console.warn("Invalid initial config:", e)
    }

    return sourceProduct
  }, [sourceProduct, initialConfig])

  // Use dynamic product if available, otherwise use initial product
  const currentProduct = dynamicProduct || initialProduct
  
  const productContext = useCreateShopperProductContext(
    currentProduct,
    inventory,
  )

  const components = useMemo(
    () => productContext.product.data?.attributes?.components ?? {},
    [productContext.product],
  )

  const component_products = useMemo(
    () => sourceProduct.included?.component_products ?? [],
    [sourceProduct],
  )

  const componentImageFiles = useMemo(
    () => sourceComponentImageFiles,
    [sourceComponentImageFiles],
  )
  
  const updateBundlePrice = useCallback((product: ProductData) => {
    setDynamicProduct(product)
    setIsPriceUpdating(false)
  }, [])
  
  const startPriceUpdate = useCallback(() => {
    setIsPriceUpdating(true)
  }, [])

  return (
    <BundleProductContext.Provider
      value={{
        components,
        component_products,
        componentImageFiles,
        isPriceUpdating,
        updateBundlePrice,
      }}
    >
      <ShopperProductProvider value={productContext}>
        <BundleProductForm
          product={productContext.product}
          locations={inventory?.attributes.locations}
          onPriceUpdateStart={startPriceUpdate}
        >
          {children}
        </BundleProductForm>
      </ShopperProductProvider>
    </BundleProductContext.Provider>
  )
}

export function useBundleProductComponents() {
  const context = useContext(BundleProductContext)
  if (!context) {
    throw new Error(
      "useBundleProductContext must be used within a BundleProductProvider",
    )
  }
  return context.components
}

export function useBundleComponentProducts() {
  const context = useContext(BundleProductContext)
  if (!context) {
    throw new Error(
      "useBundleComponentProducts must be used within a BundleProductProvider",
    )
  }
  return context.component_products
}

export function useBundleSelectedOptions() {
  const form = useFormContext<{ selectedOptions: FormSelectedOptions }>()
  return useWatch({ name: "selectedOptions", control: form.control })
}

export function useBundleComponentImageFiles() {
  const context = useContext(BundleProductContext)
  if (!context) {
    throw new Error(
      "useBundleComponentImageFiles must be used within a BundleProductProvider",
    )
  }
  return context.componentImageFiles
}

export function useBundleProductContext() {
  const context = useContext(BundleProductContext)
  if (!context) {
    throw new Error(
      "useBundleProductContext must be used within a BundleProductProvider",
    )
  }
  return context
}
