import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { Client, ProductListData } from "@epcc-sdk/sdks-shopper";

interface ProductsState {
  client: Client;
  setClient: Dispatch<SetStateAction<Client>>;
  page?: ProductListData;
}

export const ProductsProviderContext = createContext<ProductsState | null>(
  null,
);

export type ProductsProviderProps = {
  children: React.ReactNode;
  page?: ProductListData;
  client: Client;
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
