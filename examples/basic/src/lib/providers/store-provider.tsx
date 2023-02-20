import { StoreProviderProps } from "@elasticpath/react-shopper-hooks";
import { StoreProvider } from "@elasticpath/react-shopper-hooks";
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
