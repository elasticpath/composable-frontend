// TODO refactor
import { CatalogsProductVariation } from "@moltin/sdk"
import { OptionDict } from "@elasticpath/shopper-common"

export const mapOptionsToVariation = (
  options: string[],
  variations: CatalogsProductVariation[],
): OptionDict => {
  return variations.reduce(
    (acc: OptionDict, variation: CatalogsProductVariation) => {
      const x = variation.options.find((varOption) =>
        options.some((selectedOption) => varOption.id === selectedOption),
      )?.id
      return { ...acc, [variation.id]: x ? x : "" }
    },
    {},
  )
}
