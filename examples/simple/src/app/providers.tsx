"use client";
import { ReactNode, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Events } from "../lib/event-context";
import { StoreProvider } from "./(store)/StoreProvider";
import { InitialState } from "../lib/get-store-initial-state";
import { ClientProvider } from "./(store)/ClientProvider";
import { createElasticPathClient } from "./(store)/membership/create-elastic-path-client";

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
  const client = useMemo(() => createElasticPathClient(), []);
  return (
    <ClientProvider client={client}>
      <QueryClientProvider client={queryClient}>
        <Events>
          <StoreProvider initialState={initialState}>{children}</StoreProvider>
        </Events>
      </QueryClientProvider>
    </ClientProvider>
  );
}
