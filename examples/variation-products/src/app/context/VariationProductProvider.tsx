"use client"
import {
  Product,
  ProductData,
  StockResponse,
  Variation,
  type ProductMeta,
} from "@epcc-sdk/sdks-shopper"
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
  type JSX,
} from "react"
import { type OptionDict } from "./types"
import { getOptionsFromProductId } from "@/utils/get-options-from-product-id"
import {
  createEmptyOptionDict,
  mapOptionsToVariation,
} from "@/utils/map-options-to-variations"
import { SkuChangingProvider } from "./SkuChangingProvider"

export interface VariationProductProvider {
  product: ProductData
  parentProduct?: ProductData
  inventory?: StockResponse
  children: ReactNode
}

export interface VariationProductContextType {
  product: ProductData
  parentProduct?: ProductData
  setProduct: Dispatch<SetStateAction<ProductData>>
  variationsMatrix: NonNullable<ProductMeta["variation_matrix"]>
  variations: Variation[]
  isParent: boolean
  setIsParent: Dispatch<SetStateAction<boolean>>
  selectedOptions: OptionDict
  setSelectedOptions: Dispatch<SetStateAction<OptionDict>>
}

export const VariationProductContext =
  createContext<VariationProductContextType | null>(null)

export function VariationProductProvider({
  product: sourceProduct,
  children,
  parentProduct,
}: VariationProductProvider): JSX.Element {
  const [product, setProduct] = useState<ProductData>(sourceProduct)

  const [isParent, setIsParent] = useState<boolean>(
    product.data?.meta?.product_types?.[0] === "parent",
  )

  const variations =
    (isParent
      ? product.data?.meta?.variations
      : parentProduct?.data?.meta?.variations) ?? []
  const variationsMatrix =
    (isParent
      ? product.data?.meta?.variation_matrix
      : parentProduct?.data?.meta?.variation_matrix) ?? {}

  const [selectedOptions, setSelectedOptions] = useState<OptionDict>(
    resolveInitialSelectedOptions(product.data!, variations, variationsMatrix),
  )

  return (
    <VariationProductContext.Provider
      value={{
        product,
        setProduct,
        variations,
        variationsMatrix,
        isParent,
        setIsParent,
        selectedOptions,
        setSelectedOptions,
      }}
    >
      <SkuChangingProvider>{children}</SkuChangingProvider>
    </VariationProductContext.Provider>
  )
}

function resolveInitialSelectedOptions(
  product: Product,
  variations: Variation[],
  variationsMatrix: NonNullable<ProductMeta["variation_matrix"]>,
): OptionDict {
  const currentSkuOptions = getOptionsFromProductId(
    product.id!,
    variationsMatrix,
  )

  return currentSkuOptions
    ? mapOptionsToVariation(currentSkuOptions, variations ?? [])
    : createEmptyOptionDict(variations ?? [])
}
