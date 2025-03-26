"use client";
import {
  Product,
  ProductData,
  StockResponse,
  Variation,
} from "@epcc-sdk/sdks-shopper";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
  type JSX,
} from "react";
import {
  ShopperProductProvider,
  useCreateShopperProductContext,
} from "../useShopperProductContext";
import { SkuChangingProvider } from "../SkuChangingProvider";
import { VariationProductForm } from "./VariationProductForm";
import { OptionDict } from "../../../lib/types/product-types";
import { getOptionsFromProductId } from "./util/get-options-from-product-id";
import {
  createEmptyOptionDict,
  mapOptionsToVariation,
} from "./util/map-options-to-variations";
import { ProductMeta } from "@epcc-sdk/sdks-shopper/dist/client/types.gen";

export interface VariationProductProvider {
  product: ProductData;
  parentProduct?: ProductData;
  inventory?: StockResponse;
  children: ReactNode;
}

export interface VariationProductContextType {
  product: ProductData;
  parentProduct?: ProductData;
  setProduct: Dispatch<SetStateAction<ProductData>>;
  variationsMatrix: NonNullable<ProductMeta["variation_matrix"]>;
  variations: Variation[];
  isParent: boolean;
  setIsParent: Dispatch<SetStateAction<boolean>>;
  selectedOptions: OptionDict;
  setSelectedOptions: Dispatch<SetStateAction<OptionDict>>;
}

export const VariationProductContext =
  createContext<VariationProductContextType | null>(null);

export function VariationProductProvider({
  inventory,
  product: sourceProduct,
  children,
  parentProduct,
}: VariationProductProvider): JSX.Element {
  const productContext = useCreateShopperProductContext(
    sourceProduct,
    inventory,
  );

  const [product, setProduct] = useState<ProductData>(sourceProduct);

  const [isParent, setIsParent] = useState<boolean>(
    product.data?.meta?.product_types?.[0] === "parent",
  );

  const variations =
    (isParent
      ? product.data?.meta?.variations
      : parentProduct?.data?.meta?.variations) ?? [];
  const variationsMatrix =
    (isParent
      ? product.data?.meta?.variation_matrix
      : parentProduct?.data?.meta?.variation_matrix) ?? {};

  const [selectedOptions, setSelectedOptions] = useState<OptionDict>(
    resolveInitialSelectedOptions(product.data!, variations, variationsMatrix),
  );

  return (
    <VariationProductContext.Provider
      value={{
        product,
        setProduct,
        variations,
        variationsMatrix,
        isParent,
        setIsParent,
        selectedOptions,
        setSelectedOptions,
      }}
    >
      <SkuChangingProvider>
        <ShopperProductProvider value={productContext}>
          <VariationProductForm
            product={product}
            locations={inventory?.attributes.locations}
          >
            {children}
          </VariationProductForm>
        </ShopperProductProvider>
      </SkuChangingProvider>
    </VariationProductContext.Provider>
  );
}

function resolveInitialSelectedOptions(
  product: Product,
  variations: Variation[],
  variationsMatrix: NonNullable<ProductMeta["variation_matrix"]>,
): OptionDict {
  const currentSkuOptions = getOptionsFromProductId(
    product.id!,
    variationsMatrix,
  );

  return currentSkuOptions
    ? mapOptionsToVariation(currentSkuOptions, variations ?? [])
    : createEmptyOptionDict(variations ?? []);
}
