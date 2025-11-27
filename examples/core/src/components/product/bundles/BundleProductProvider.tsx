"use client";
import {
  Components,
  ElasticPathFile,
  Location,
  Product,
  ProductData,
  StockResponse,
} from "@epcc-sdk/sdks-shopper";
import { createContext, ReactNode, type JSX, useContext, useMemo } from "react";
import {
  ShopperProductProvider,
  useCreateShopperProductContext,
} from "../useShopperProductContext";
import { BundleProductForm } from "./BundleProductForm";
import { useFormContext, useWatch } from "react-hook-form";
import { FormSelectedOptions } from "./form-parsers";

export interface BundleProductProvider {
  product: ProductData;
  componentImageFiles: ElasticPathFile[];
  inventory?: StockResponse;
  children: ReactNode;
  locations?: Location[];
}

export interface BundleProductContextType {
  components: Components;
  component_products: Product[];
  componentImageFiles: ElasticPathFile[];
}

export const BundleProductContext =
  createContext<BundleProductContextType | null>(null);

export function BundleProductProvider({
  inventory,
  componentImageFiles: sourceComponentImageFiles,
  product: sourceProduct,
  children,
  locations,
}: BundleProductProvider): JSX.Element {
  const productContext = useCreateShopperProductContext(
    sourceProduct,
    inventory,
    locations,
  );

  const components = useMemo(
    () => productContext.product.data?.attributes?.components ?? {},
    [productContext.product],
  );

  const component_products = useMemo(
    () => sourceProduct.included?.component_products ?? [],
    [sourceProduct],
  );

  const componentImageFiles = useMemo(
    () => sourceComponentImageFiles,
    [sourceComponentImageFiles],
  );

  return (
    <BundleProductContext.Provider
      value={{
        components,
        component_products,
        componentImageFiles,
      }}
    >
      <ShopperProductProvider value={productContext}>
        <BundleProductForm
          product={productContext.product}
          locations={inventory?.attributes.locations}
        >
          {children}
        </BundleProductForm>
      </ShopperProductProvider>
    </BundleProductContext.Provider>
  );
}

export function useBundleProductComponents() {
  const context = useContext(BundleProductContext);
  if (!context) {
    throw new Error(
      "useBundleProductContext must be used within a BundleProductProvider",
    );
  }
  return context.components;
}

export function useBundleComponentProducts() {
  const context = useContext(BundleProductContext);
  if (!context) {
    throw new Error(
      "useBundleComponentProducts must be used within a BundleProductProvider",
    );
  }
  return context.component_products;
}

export function useBundleSelectedOptions() {
  const form = useFormContext<{ selectedOptions: FormSelectedOptions }>();
  return useWatch({ name: "selectedOptions", control: form.control });
}

export function useBundleComponentImageFiles() {
  const context = useContext(BundleProductContext);
  if (!context) {
    throw new Error(
      "useBundleComponentImageFiles must be used within a BundleProductProvider",
    );
  }
  return context.componentImageFiles;
}
