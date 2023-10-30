import { StoreProviderProps } from "@elasticpath/react-shopper-hooks";
import { StoreProvider } from "@elasticpath/react-shopper-hooks";
import { getEpccImplicitClient } from "../epcc-implicit-client";
import { getCartCookieClient } from "../cart-cookie-client";

const StoreNextJSProvider = (
  props: Omit<StoreProviderProps, "resolveCartId" | "client">,
) => {
  const client = getEpccImplicitClient();
  return (
    <StoreProvider
      {...props}
      resolveCartId={getCartCookieClient}
      client={client}
    />
  );
};

export default StoreNextJSProvider;
