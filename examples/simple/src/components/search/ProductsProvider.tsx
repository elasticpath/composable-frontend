import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import type {
  Moltin as EPCCClient,
  ShopperCatalogResourcePage,
} from "@moltin/sdk";
import { ShopperProduct } from "@elasticpath/react-shopper-hooks";

interface ProductsState {
  client: EPCCClient;
  setClient: Dispatch<SetStateAction<EPCCClient>>;
  page?: ShopperCatalogResourcePage<ShopperProduct>;
}

export const ProductsProviderContext = createContext<ProductsState | null>(
  null,
);

export type ProductsProviderProps = {
  children: React.ReactNode;
  page?: ShopperCatalogResourcePage<ShopperProduct>;
  client: EPCCClient;
};

export const ProductsProvider = ({
  children,
  page,
  client: initialClient,
}: ProductsProviderProps) => {
  const [client, setClient] = useState(initialClient);

  return (
    <ProductsProviderContext.Provider value={{ client, setClient, page }}>
      {children}
    </ProductsProviderContext.Provider>
  );
};

export function useProducts() {
  const context = useContext(ProductsProviderContext);
  if (context === null) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
