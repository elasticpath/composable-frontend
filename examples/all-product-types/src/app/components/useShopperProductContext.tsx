import {
  BundleConfiguration,
  ProductData,
  StockResponse,
} from "@epcc-sdk/sdks-shopper"
import { ExtractedMedia, extractProductMedia } from "./extract-media"
import { createContext, useContext, useMemo, useOptimistic, startTransition } from "react"

export type ShopperProductContextType = {
  product: ProductData
  inventory?: StockResponse
  media: ExtractedMedia
  configureBundle?: (bundleConfiguration: BundleConfiguration) => void
}

export const ShopperProductContext =
  createContext<ShopperProductContextType | null>(null)

export const ShopperProductProvider = ShopperProductContext.Provider

export function useCreateShopperProductContext(
  product: ProductData,
  inventory?: StockResponse,
) {
  const [optimisticProduct, updateOptimisticProduct] = useOptimistic(
    product,
    productReducer,
  )

  const extractedMedia = useMemo(
    () => extractProductMedia(optimisticProduct),
    [optimisticProduct],
  )

  const configureBundle = (bundleConfiguration: BundleConfiguration) => {
    startTransition(() => {
      updateOptimisticProduct({
        type: "CONFIGURE_BUNDLE",
        payload: { bundle_configuration: bundleConfiguration },
      })
    })
  }

  return useMemo(() => {
    return {
      product: optimisticProduct,
      inventory,
      media: extractedMedia,
      configureBundle,
    }
  }, [optimisticProduct, inventory, extractedMedia])
}

export function useShopperProductContext() {
  const context = useContext(ShopperProductContext)
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider")
  }
  return context
}

type ProductAction = {
  type: "CONFIGURE_BUNDLE"
  payload: { bundle_configuration: BundleConfiguration }
}

function productReducer(
  state: ProductData,
  action: ProductAction,
): ProductData {
  switch (action.type) {
    case "CONFIGURE_BUNDLE": {
      const { bundle_configuration } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          meta: {
            ...state.data?.meta,
            bundle_configuration,
          },
        },
      }
    }
    default:
      return state
  }
}