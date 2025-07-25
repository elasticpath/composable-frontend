import { type Variation } from "@epcc-sdk/sdks-shopper"

export const mapOptionsToVariation = (
  options: string[],
  variations: Variation[],
): {
  [key: string]: string
} => {
  return variations.reduce(
    (
      acc: {
        [key: string]: string
      },
      variation: Variation,
    ) => {
      const x = variation.options?.find((varOption) =>
        options.some((selectedOption) => varOption.id === selectedOption),
      )?.id
      return { ...acc, [variation.id!]: x ? x : "" }
    },
    {},
  )
}

export const createEmptyOptionDict = (
  variations: Variation[],
): {
  [key: string]: any
} => variations.reduce((acc, c) => ({ ...acc, [c.id!]: undefined }), {})
