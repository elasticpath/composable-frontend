"use client";

import React, { createContext, ReactNode, useContext } from "react";
import { Client } from "@epcc-sdk/sdks-shopper";
interface ClientContextType {
  client: Client;
}

export const ClientProviderContext = createContext<ClientContextType | null>(
  null,
);

export const ClientProvider = ({
  children,
  client,
}: {
  children: ReactNode;
  client: Client;
}) => {
  return (
    <ClientProviderContext.Provider value={{ client }}>
      {children}
    </ClientProviderContext.Provider>
  );
};

export function useElasticPathClient() {
  const context = useContext(ClientProviderContext);
  if (!context) {
    throw new Error(
      "useElasticPathClient must be used within a ElasticPathProvider",
    );
  }
  return context;
}
