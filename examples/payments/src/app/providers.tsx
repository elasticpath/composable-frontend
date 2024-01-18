"use client";
import { ReactNode } from "react";
import {
  AccountProvider,
  StoreProvider,
  ElasticPathProvider,
  InitialState,
} from "@elasticpath/react-shopper-hooks";
import { QueryClient } from "@tanstack/react-query";
import { getEpccImplicitClient } from "../lib/epcc-implicit-client";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../lib/cookie-constants";
import { getCookie } from "cookies-next";
import { COOKIE_PREFIX_KEY } from "../lib/resolve-cart-env";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60 * 24,
      retry: 1,
    },
  },
});

export function Providers({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: InitialState;
}) {
  const client = getEpccImplicitClient();

  /**
   * The cart cookie is set by nextjs middleware.
   */
  const cartCookie = getCookie(`${COOKIE_PREFIX_KEY}_ep_cart`);

  return (
    <ElasticPathProvider
      client={client}
      queryClientProviderProps={{ client: queryClient }}
    >
      <StoreProvider initialState={initialState} cartId={cartCookie}>
        <AccountProvider accountCookieName={ACCOUNT_MEMBER_TOKEN_COOKIE_NAME}>
          {children}
        </AccountProvider>
      </StoreProvider>
    </ElasticPathProvider>
  );
}
