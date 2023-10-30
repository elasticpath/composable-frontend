"use client";

import StoreNextJSProvider from "../lib/providers/store-provider";
import { ReactNode } from "react";
import { StoreContext } from "@elasticpath/react-shopper-hooks";

export function Providers({
  children,
  store,
}: {
  children: ReactNode;
  store: StoreContext;
}) {
  return (
    <StoreNextJSProvider storeContext={store}>{children}</StoreNextJSProvider>
  );
}
