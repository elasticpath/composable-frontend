import { MatrixObjectEntry, MatrixValue } from "../../src/lib/types/matrix-object-entry";

// This function has been copied from product-helper.ts which now has a dependency on react-shopper-hooks which breaks playwright.
export const getSkuIdFromOptions = (
  options: string[],
  matrix: MatrixObjectEntry | MatrixValue,
): string | undefined => {
  if (typeof matrix === "string") {
    return matrix;
  }

  for (const currOption in options) {
    const nestedMatrix = matrix[options[currOption]];
    if (nestedMatrix) {
      return getSkuIdFromOptions(options, nestedMatrix);
    }
  }

  return undefined;
};
