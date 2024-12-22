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

  return (
    <ElasticPathProvider
      client={client}
      queryClientProviderProps={{ client: queryClient }}
    >
      <StoreProvider initialState={initialState}>
        <AccountProvider accountCookieName={ACCOUNT_MEMBER_TOKEN_COOKIE_NAME}>
          {children}
        </AccountProvider>
      </StoreProvider>
    </ElasticPathProvider>
  );
}
