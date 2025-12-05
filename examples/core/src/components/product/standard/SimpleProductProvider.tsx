"use client";
import { Location, ProductData, ResponseCurrency, StockResponse } from "@epcc-sdk/sdks-shopper";
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
  currency?: ResponseCurrency;
}

export function SimpleProductProvider({
  inventory,
  product,
  children,
  locations,
  currency,
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
        currency={currency}
      >
        {children}
      </SimpleProductForm>
    </ShopperProductProvider>
  );
}
