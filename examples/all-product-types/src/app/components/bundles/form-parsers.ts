import { BundleConfiguration } from "@epcc-sdk/sdks-shopper"

export interface FormSelectedOptions {
  [key: string]: string[]
}

export function selectedOptionsToFormValues(
  selectedOptions: BundleConfiguration["selected_options"],
): FormSelectedOptions {
  return Object.keys(selectedOptions).reduce((acc, componentKey) => {
    const componentOptions = selectedOptions[componentKey]!

    return {
      ...acc,
      [componentKey]: Object.keys(componentOptions).reduce(
        (innerAcc, optionKey) => {
          return [
            ...innerAcc,
            JSON.stringify(
              { [optionKey]: componentOptions[optionKey] },
              bigIntToNumberReplacer,
            ),
          ]
        },
        [] as string[],
      ),
    }
  }, {})
}

export function formSelectedOptionsToData(
  selectedOptions: FormSelectedOptions,
): BundleConfiguration["selected_options"] {
  return Object.keys(selectedOptions).reduce((acc, componentKey) => {
    const componentOptions = selectedOptions[componentKey]

    return {
      ...acc,
      [componentKey]: componentOptions?.reduce(
        (innerAcc, optionStr) => {
          const parsed = JSON.parse(
            optionStr,
            bigIntReviver,
          ) as BundleConfiguration["selected_options"][number]

          return {
            ...innerAcc,
            ...parsed,
          }
        },
        {} as BundleConfiguration["selected_options"][number],
      ),
    }
  }, {})
}

export function bigIntToNumberReplacer<TValue>(_key: string, value: TValue) {
  return typeof value === "bigint" ? Number(value) : value
}

export function bigIntReviver(_key: string, value: unknown) {
  // If it's a string of digits, interpret it as a BigInt
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return BigInt(value)
  }
  return value
}