"use client";
import { useContext, useEffect, useMemo, useRef } from "react";
import { SkuChangeOpacityWrapper } from "../SkuChangeOpacityWrapper";
import { useVariationProduct } from "./useVariationContext";
import { SkuChangingContext } from "../../../lib/sku-changing-context";
import { useParams, useRouter } from "next/navigation";
import { getProductURLSegment, getSkuIdFromOptions } from "../../../lib/product-helper";
import { allVariationsHaveSelectedOption } from "./util/all-variations-have-selected-option";
import { getFamilyVariations, getVariationMatrix } from "../../../lib/product-family";
import {
  resolveVariationSwatches,
  swatchSourcesFromChildProducts,
} from "../../../lib/variation-swatches";
import {
  VariationOptions,
  variationGroupName,
} from "../../variation-options/VariationOptions";

let groupToRefocusAfterVariantNavigation: string | undefined;

const ProductVariations = () => {
  const { lang } = useParams();
  
  const {
    variations,
    variationsMatrix,
    product,
    parentProduct,
    variationProducts,
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

    const selectedVariation = variationProducts?.data?.find(
      (variation: any) => variation.id === selectedSkuId
    );
    const productSlug = selectedVariation?.attributes?.slug;
    const canonicalURL = getProductURLSegment({ id: selectedSkuId, attributes: { slug: productSlug } });

    if (
      !context?.isChangingSku &&
      selectedSkuId &&
      selectedSkuId !== currentProductId &&
      allVariationsHaveSelectedOption(selectedOptions, variations)
    ) {
      context?.setIsChangingSku(true);
      router.replace(
        lang
          ? `/${lang}${canonicalURL}`
          : canonicalURL,
        { scroll: false },
      );
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

  const groupIdPrefix = parentProduct?.data?.id ?? currentProductId ?? "product";
  const groupToRefocus = useRef(groupToRefocusAfterVariantNavigation);
  useEffect(() => {
    groupToRefocusAfterVariantNavigation = undefined;
  }, []);

  const familyVariations = useMemo(
    () => getFamilyVariations({ meta: { variations } }),
    [variations],
  );
  const swatchSources = useMemo(
    () => swatchSourcesFromChildProducts(variationProducts),
    [variationProducts],
  );
  const selectedOptionIds = familyVariations.map(
    (variation) => selectedOptions[variation.id],
  );
  const swatches = resolveVariationSwatches({
    variations: familyVariations,
    matrix: getVariationMatrix({ meta: { variation_matrix: variationsMatrix } }),
    sources: swatchSources,
    selectedOptionIds,
  });

  return (
    <SkuChangeOpacityWrapper>
      <VariationOptions
        appearance="page"
        groupIdPrefix={groupIdPrefix}
        variations={familyVariations}
        swatches={swatches}
        selectedOptionIds={selectedOptionIds}
        focusSelectedOptionOfGroup={groupToRefocus.current}
        onSelect={(variationIndex, optionId) => {
          const variationId = familyVariations[variationIndex]!.id;
          groupToRefocusAfterVariantNavigation = variationGroupName(
            groupIdPrefix,
            variationId,
          );
          updateSelectedOptions(variationId, optionId);
        }}
      />
    </SkuChangeOpacityWrapper>
  );
};

export default ProductVariations;
