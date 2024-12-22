import { BundleConfigurationSelectedOptions } from "@elasticpath/react-shopper-hooks";

export interface FormSelectedOptions {
  [key: string]: string[];
}

export function selectedOptionsToFormValues(
  selectedOptions: BundleConfigurationSelectedOptions,
): FormSelectedOptions {
  return Object.keys(selectedOptions).reduce((acc, componentKey) => {
    const componentOptions = selectedOptions[componentKey];

    return {
      ...acc,
      [componentKey]: Object.keys(componentOptions).reduce(
        (innerAcc, optionKey) => {
          return [
            ...innerAcc,
            JSON.stringify({ [optionKey]: componentOptions[optionKey] }),
          ];
        },
        [] as string[],
      ),
    };
  }, {});
}

export function formSelectedOptionsToData(
  selectedOptions: FormSelectedOptions,
): BundleConfigurationSelectedOptions {
  return Object.keys(selectedOptions).reduce((acc, componentKey) => {
    const componentOptions = selectedOptions[componentKey];

    return {
      ...acc,
      [componentKey]: componentOptions.reduce(
        (innerAcc, optionStr) => {
          const parsed = JSON.parse(
            optionStr,
          ) as BundleConfigurationSelectedOptions[0];

          return {
            ...innerAcc,
            ...parsed,
          };
        },
        {} as BundleConfigurationSelectedOptions[0],
      ),
    };
  }, {});
}
