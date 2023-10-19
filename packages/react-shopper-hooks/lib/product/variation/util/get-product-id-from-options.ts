import { MatrixObjectEntry, MatrixValue } from "@elasticpath/shopper-common"

export const getProductIdFromOptions = (
  options: string[],
  matrix: MatrixObjectEntry | MatrixValue,
): string | undefined => {
  if (typeof matrix === "string") {
    return matrix
  }

  for (const currOption in options) {
    const nestedMatrix = matrix[options[currOption]]
    if (nestedMatrix) {
      return getProductIdFromOptions(options, nestedMatrix)
    }
  }

  return undefined
}
