import type { OptionDict } from "@elasticpath/shopper-common"
import type { CatalogsProductVariation } from "@elasticpath/js-sdk"

export function allVariationsHaveSelectedOption(
  optionsDict: OptionDict,
  variations: CatalogsProductVariation[],
): boolean {
  return !variations.some((variation) => !optionsDict[variation.id])
}
