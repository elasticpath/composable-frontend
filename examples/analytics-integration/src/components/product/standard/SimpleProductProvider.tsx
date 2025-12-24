"use client";
import { ProductData, StockResponse } from "@epcc-sdk/sdks-shopper";
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
}

export function SimpleProductProvider({
  inventory,
  product,
  children,
}: SimpleProductProvider): JSX.Element {
  const productContext = useCreateShopperProductContext(product, inventory);

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
