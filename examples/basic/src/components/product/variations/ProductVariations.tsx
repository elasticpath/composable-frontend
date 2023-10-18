import type { CatalogsProductVariation } from "@moltin/sdk";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useEffect } from "react";
import { OptionDict } from "../../../lib/types/product-types";
import { ProductContext } from "../../../lib/product-util";
import {
  allVariationsHaveSelectedOption,
  getSkuIdFromOptions,
} from "../../../lib/product-helper";
import ProductVariationStandard from "./ProductVariationStandard";
import ProductVariationColor from "./ProductVariationColor";
import { useVariationProduct } from "@elasticpath/react-shopper-hooks";

const getSelectedOption = (
  variationId: string,
  optionLookupObj: OptionDict,
): string => {
  return optionLookupObj[variationId];
};

const ProductVariations = (): JSX.Element => {
  const {
    variations,
    variationsMatrix,
    product,
    selectedOptions,
    updateSelectedOptions,
  } = useVariationProduct();

  const currentProductId = product.response.id;

  const context = useContext(ProductContext);

  const router = useRouter();

  useEffect(() => {
    const selectedSkuId = getSkuIdFromOptions(
      Object.values(selectedOptions),
      variationsMatrix,
    );

    if (
      !context?.isChangingSku &&
      selectedSkuId &&
      selectedSkuId !== currentProductId &&
      allVariationsHaveSelectedOption(selectedOptions, variations)
    ) {
      context?.setIsChangingSku(true);
      router.push(`/products/${selectedSkuId}`).then(() => {
        context?.setIsChangingSku(false);
      });
    }
  }, [
    selectedOptions,
    context,
    currentProductId,
    router,
    variations,
    variationsMatrix,
  ]);

  return (
    <div
      className={`flex flex-col gap-4 ${
        context?.isChangingSku ? "opacity-50" : "opacity-100"
      }}`}
    >
      {variations.map((v) =>
        resolveVariationComponentByName(
          v,
          updateSelectedOptions,
          getSelectedOption(v.id, selectedOptions),
        ),
      )}
    </div>
  );
};

function resolveVariationComponentByName(
  v: CatalogsProductVariation,
  updateOptionHandler: ReturnType<
    typeof useVariationProduct
  >["updateSelectedOptions"],
  selectedOptionId?: string,
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
