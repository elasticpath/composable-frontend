import { useCallback, useContext } from "react";
import { ProductData, Variation } from "@epcc-sdk/sdks-shopper";
import { VariationProductContext } from "./VariationProductProvider";
import type { ProductListData, ProductMeta } from "@epcc-sdk/sdks-shopper";

export function useVariationProduct(): {
  product: ProductData;
  isParent: boolean;
  parentProduct?: ProductData;
  variationProducts?: ProductListData;
  variations: Variation[];
  variationsMatrix: NonNullable<ProductMeta["variation_matrix"]>;
  selectedOptions: Record<string, string>;
  updateSelectedOptions: (variationId: string, optionId: string) => void;
  getSelectedOption: (variationId: string) => string;
} {
  const ctx = useContext(VariationProductContext);

  if (!ctx) {
    throw new Error(
      "Variation Product Context was unexpectedly null, make sure you are using the useVariationProduct hook inside a VariationProductProvider!",
    );
  }

  const {
    product,
    isParent,
    variations,
    variationsMatrix,
    selectedOptions,
    setSelectedOptions,
    parentProduct,
    variationProducts,
  } = ctx;

  const updateSelectedOptions = useCallback(
    (variationId: string, optionId: string) => {
      for (const selectedOptionKey in selectedOptions) {
        if (selectedOptionKey === variationId) {
          setSelectedOptions({
            ...selectedOptions,
            [selectedOptionKey]: optionId,
          });
          break;
        }
      }
    },
    [setSelectedOptions, selectedOptions],
  );

  const getSelectedOption = useCallback(
    (variationId: string): string => {
      return selectedOptions[variationId]!;
    },
    [selectedOptions],
  );

  return {
    product,
    isParent,
    parentProduct,
    variationProducts,
    variations,
    variationsMatrix,
    selectedOptions,
    updateSelectedOptions,
    getSelectedOption,
  };
}
