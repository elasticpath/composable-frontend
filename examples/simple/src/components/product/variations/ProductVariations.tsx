"use client";
import { useContext, useEffect } from "react";
import { OptionDict } from "../../../lib/types/product-types";
import clsx from "clsx";
import { SkuChangeOpacityWrapper } from "../SkuChangeOpacityWrapper";
import { useVariationProduct } from "./useVariationContext";
import { SkuChangingContext } from "../../../lib/sku-changing-context";
import { useRouter } from "next/navigation";
import { getSkuIdFromOptions } from "../../../lib/product-helper";
import { allVariationsHaveSelectedOption } from "./util/all-variations-have-selected-option";

const getSelectedOption = (
  variationId: string,
  optionLookupObj: OptionDict,
): string => {
  return optionLookupObj[variationId]!;
};

const ProductVariations = () => {
  const {
    variations,
    variationsMatrix,
    product,
    selectedOptions,
    updateSelectedOptions,
  } = useVariationProduct();

  const currentProductId = product.data?.id;

  const context = useContext(SkuChangingContext);

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
      router.replace(`/products/${selectedSkuId}`, { scroll: false });
      context?.setIsChangingSku(false);
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
    <SkuChangeOpacityWrapper className="flex flex-col gap-4">
      {variations.map((variation) => {
        const selectedOptionId = getSelectedOption(
          variation.id!,
          selectedOptions,
        );
        return (
          <div key={variation.id!} className="grid gap-2">
            <h2>{variation.name}</h2>
            <div className="flex flex-wrap gap-2">
              {variation.options?.map((o) => (
                <button
                  type="button"
                  className={clsx(
                    o.id === selectedOptionId
                      ? "bg-brand-primary text-white"
                      : "bg-white text-gray-800",
                    "p6 rounded-md border px-6 py-3 font-semibold",
                  )}
                  key={o.id}
                  onClick={() => updateSelectedOptions(variation.id!, o.id!)}
                >
                  {o.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </SkuChangeOpacityWrapper>
  );
};

export default ProductVariations;
