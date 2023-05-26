import { BundleConfigurationSelectedOptions } from "@lib/product/bundle/bundle.types"

export function isSelectedOption(
  selectedOptions: BundleConfigurationSelectedOptions[0]
) {
  return function _innerIsSelectedOption(optionId: string): boolean {
    return Object.keys(selectedOptions).some(
      (optionKey) => optionKey === optionId
    )
  }
}
