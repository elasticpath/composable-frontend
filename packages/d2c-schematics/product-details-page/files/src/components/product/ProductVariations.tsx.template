import { Stack } from "@chakra-ui/react";
import type { CatalogsProductVariation } from "@moltin/sdk";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useEffect, useState } from "react";
import { OptionDict } from "../../lib/types/product-types";
import { createEmptyOptionDict, ProductContext } from "../../lib/product-util";
import {
  allVariationsHaveSelectedOption,
  getOptionsFromSkuId,
  getSkuIdFromOptions,
  mapOptionsToVariation,
} from "../../lib/product-helper";
import ProductVariationStandard, {
  UpdateOptionHandler,
} from "./variations/ProductVariationStandard";
import ProductVariationColor from "./variations/ProductVariationColor";
import { MatrixObjectEntry } from "../../lib/types/matrix-object-entry";

interface IProductVariations {
  variations: CatalogsProductVariation[];
  variationsMatrix: MatrixObjectEntry;
  baseProductSlug: string;
  currentSkuId: string;
  skuOptions?: string[];
}

const getSelectedOption = (
  variationId: string,
  optionLookupObj: OptionDict
): string => {
  return optionLookupObj[variationId];
};

const ProductVariations = ({
  variations,
  baseProductSlug,
  currentSkuId,
  variationsMatrix,
}: IProductVariations): JSX.Element => {
  const currentSkuOptions = getOptionsFromSkuId(currentSkuId, variationsMatrix);
  const initialOptions = currentSkuOptions
    ? mapOptionsToVariation(currentSkuOptions, variations)
    : createEmptyOptionDict(variations);

  const context = useContext(ProductContext);
  const [selectedOptions, setSelectedOptions] =
    useState<OptionDict>(initialOptions);
  const router = useRouter();

  useEffect(() => {
    const selectedSkuId = getSkuIdFromOptions(
      Object.values(selectedOptions),
      variationsMatrix
    );

    if (
      !context?.isChangingSku &&
      selectedSkuId &&
      selectedSkuId !== currentSkuId &&
      allVariationsHaveSelectedOption(selectedOptions, variations)
    ) {
      context?.setIsChangingSku(true);
      router.push(`/products/${selectedSkuId}`).then(() => {
        context?.setIsChangingSku(false);
      });
    }
  }, [
    selectedOptions,
    baseProductSlug,
    context,
    currentSkuId,
    router,
    variations,
    variationsMatrix,
  ]);

  const updateOptionHandler: UpdateOptionHandler =
    (variationId) =>
    (optionId): void => {
      for (const selectedOptionKey in selectedOptions) {
        if (selectedOptionKey === variationId) {
          setSelectedOptions({
            ...selectedOptions,
            [selectedOptionKey]: optionId,
          });
          break;
        }
      }
    };

  return (
    <Stack opacity={context?.setIsChangingSku ? "50" : "100"}>
      {variations.map((v) =>
        resolveVariationComponentByName(
          v,
          updateOptionHandler,
          getSelectedOption(v.id, selectedOptions)
        )
      )}
    </Stack>
  );
};

function resolveVariationComponentByName(
  v: CatalogsProductVariation,
  updateOptionHandler: UpdateOptionHandler,
  selectedOptionId?: string
): JSX.Element {
  switch (v.name.toLowerCase()) {
    case "color":
      return (
        <ProductVariationColor
          key={v.id}
          variation={v}
          updateOptionHandler={updateOptionHandler}
          selectedOptionId={selectedOptionId}
        />
      );
    default:
      return (
        <ProductVariationStandard
          key={v.id}
          variation={v}
          updateOptionHandler={updateOptionHandler}
          selectedOptionId={selectedOptionId}
        />
      );
  }
}

export default ProductVariations;
