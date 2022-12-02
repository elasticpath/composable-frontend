import { StoreProviderProps } from "@field123/epcc-react";
import { StoreProvider } from "@field123/epcc-react";
import { getEpccImplicitClient } from "../epcc-implicit-client";
import { getCartCookie } from "../cart-cookie";

const StoreNextJSProvider = (
  props: Omit<StoreProviderProps, "resolveCartId" | "client">
) => {
  const client = getEpccImplicitClient();
  return (
    <StoreProvider {...props} resolveCartId={getCartCookie} client={client} />
  );
};

export default StoreNextJSProvider;
