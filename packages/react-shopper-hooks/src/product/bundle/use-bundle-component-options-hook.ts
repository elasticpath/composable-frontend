import { useContext, useMemo } from "react"
import { isSelectedOption as _isSelectedOption } from "../../product/bundle/util/is-selected-option"
import { BundleProductContext } from "../../product/bundle/bundle-provider"
import { File, ProductComponentOption, ProductResponse } from "@moltin/sdk"

export function useBundleComponentOption(
  componentKey: string,
  optionId: string,
): {
  isSelected: boolean
  optionProduct: ProductResponse
  option?: ProductComponentOption
  mainImage: File | null
} {
  const ctx = useContext(BundleProductContext)

  if (!ctx) {
    throw new Error(
      "Product Component Context was unexpectedly null, make sure you are using the useBundleComponentOption hook inside a BundleProductProvider!",
    )
  }

  const {
    components,
    selectedOptions,
    componentProductImages,
    componentProducts,
  } = ctx

  const component = useMemo(() => {
    return components[componentKey]
  }, [components])

  const option = component.options.find((option) => option.id === optionId)

  const optionProduct = componentProducts.find((item) => item.id === optionId)

  if (!optionProduct) {
    throw new Error(
      `Could not find component product for option id ${optionId}`,
    )
  }

  const isSelected = useMemo(
    () => _isSelectedOption(selectedOptions[componentKey])(optionId),
    [selectedOptions, componentKey, optionId],
  )

  const mainImageId = optionProduct.relationships?.main_image?.data?.id
  const mainImage = useMemo(
    () =>
      mainImageId
        ? componentProductImages.find((img) => img.id === mainImageId) ?? null
        : null,
    [componentProductImages],
  )

  return {
    option,
    optionProduct,
    isSelected,
    mainImage,
  }
}
