"use client";
import { Location, ProductData, StockResponse } from "@epcc-sdk/sdks-shopper";
import { ReactNode, type JSX } from "react";
import {
  ShopperProductProvider,
  useCreateShopperProductContext,
} from "../useShopperProductContext";
import { SimpleProductForm } from "./SimpleProductForm";

export interface SimpleProductProvider {
  product: ProductData;
  inventory?: StockResponse;
  children: ReactNode;
  locations?: Location[];
}

export function SimpleProductProvider({
  inventory,
  product,
  children,
  locations,
}: SimpleProductProvider): JSX.Element {
  const productContext = useCreateShopperProductContext(
    product,
    inventory,
    locations,
  );

  return (
    <ShopperProductProvider value={productContext}>
      <SimpleProductForm
        product={product}
        locations={inventory?.attributes.locations}
      >
        {children}
      </SimpleProductForm>
    </ShopperProductProvider>
  );
}
