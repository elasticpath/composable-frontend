import type { OptionDict } from "@lib/product"
import type { CatalogsProductVariation } from "@moltin/sdk"

export function allVariationsHaveSelectedOption(
  optionsDict: OptionDict,
  variations: CatalogsProductVariation[]
): boolean {
  return !variations.some((variation) => !optionsDict[variation.id])
}
