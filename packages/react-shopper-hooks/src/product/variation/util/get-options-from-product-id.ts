import { MatrixObjectEntry, MatrixValue } from "@elasticpath/shopper-common"

export const getOptionsFromProductId = (
  skuId: string,
  entry: MatrixObjectEntry | MatrixValue,
  options: string[] = [],
): string[] | undefined => {
  if (typeof entry === "string") {
    return entry === skuId ? options : undefined
  }

  let acc: string[] | undefined
  Object.keys(entry).every((key) => {
    const result = getOptionsFromProductId(skuId, entry[key], [...options, key])
    if (result) {
      acc = result
      return false
    }
    return true
  })
  return acc
}
