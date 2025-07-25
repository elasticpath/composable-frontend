import {
  ComponentProductOption,
  ElasticPathFile,
  Product,
} from "@epcc-sdk/sdks-shopper"
import {
  useBundleComponentImageFiles,
  useBundleComponentProducts,
} from "./BundleProductProvider"
import { useMemo } from "react"
import { useBundleComponent } from "./useBundleComponent"

export function useBundleComponentOption(
  componentKey: string,
  optionId: string,
): {
  isSelected: boolean
  optionProduct: Product
  option?: ComponentProductOption
  mainImage: ElasticPathFile | null
} {
  const componentProducts = useBundleComponentProducts()
  const { component, isSelectedOption } = useBundleComponent(componentKey)
  const componentProductImages = useBundleComponentImageFiles()

  const option = component.options?.find((option) => option.id === optionId)

  const optionProduct = componentProducts.find((item) => item.id === optionId)

  if (!optionProduct) {
    throw new Error(
      `Could not find component product for option id ${optionId}`,
    )
  }

  const mainImageId = optionProduct.relationships?.main_image?.data?.id
  const mainImage = useMemo(
    () =>
      mainImageId
        ? (componentProductImages.find((img) => img.id === mainImageId) ?? null)
        : null,
    [componentProductImages],
  )

  return {
    option,
    optionProduct,
    isSelected: isSelectedOption(optionId),
    mainImage,
  }
}