import { CatalogsProductVariation } from "@moltin/sdk"
import { OptionDict } from "@elasticpath/shopper-common"

export const createEmptyOptionDict = (
  variations: CatalogsProductVariation[],
): OptionDict =>
  variations.reduce((acc, c) => ({ ...acc, [c.id]: undefined }), {})
