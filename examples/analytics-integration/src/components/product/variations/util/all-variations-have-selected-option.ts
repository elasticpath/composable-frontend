import { Variation } from "@epcc-sdk/sdks-shopper";

export function allVariationsHaveSelectedOption(
  optionsDict: Record<string, string>,
  variations: Variation[],
): boolean {
  return !variations.some((variation) => !optionsDict[variation.id!]);
}
