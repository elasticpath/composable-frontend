import type { CatalogsProductVariation, ProductResponse } from "@elasticpath/js-sdk";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { useEffect } from "react";
import { OptionDict } from "../../../lib/types/product-types";
import {
  allVariationsHaveSelectedOption,
  getSkuIdFromOptions,
  VariationBaseProduct,
  VariationChildProduct
} from "../../../lib/product-helper";
import ProductVariationStandard from "./ProductVariationStandard";
import ProductVariationColor from "./ProductVariationColor";
import { BaseProductResponse, useVariationProduct, VariationProductContext} from "@elasticpath/react-shopper-hooks";
import { ProductContext } from "../../../lib/product-context";

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
    let slug;

    if(product.kind === "child-product" && selectedSkuId) {
      const resultProduct = product as VariationChildProduct;
      slug = resultProduct.siblingProducts.filter((sibling) => sibling.id === selectedSkuId)[0].slug;
      if(slug === null) {
        console.log(`selected option ${selectedSkuId} not found in siblingProducts`); 
      }
    }

    if(product.kind === "base-product" && selectedSkuId) {
      const baseProduct= product as VariationBaseProduct
      slug = baseProduct.childProducts.filter((child) => child.id === selectedSkuId)[0].slug;
      if(slug === null) {
       console.log(`selected option ${selectedSkuId} not found in childProducts`); 
      }
    }

    if (
      !context?.isChangingSku &&
      selectedSkuId &&
      selectedSkuId !== currentProductId &&
      allVariationsHaveSelectedOption(selectedOptions, variations)
    ) {
      context?.setIsChangingSku(true);
      if(slug) {
        router.replace(`/products/${slug}/${selectedSkuId}`, { scroll: false });
      }else {
        router.replace(`/products/${selectedSkuId}`, { scroll: false });
      }
      
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
