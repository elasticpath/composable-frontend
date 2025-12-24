"use client";

import React, { createContext, ReactNode, useContext } from "react";
import { InitialState } from "../../lib/get-store-initial-state";
import { NavigationNode } from "../../lib/build-site-navigation";

interface StoreState {
  nav?: NavigationNode[];
}

export const StoreProviderContext = createContext<StoreState | null>(null);

export const StoreProvider = ({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: InitialState;
}) => {
  return (
    <StoreProviderContext.Provider value={{ nav: initialState?.nav }}>
      {children}
    </StoreProviderContext.Provider>
  );
};

export function useStore() {
  const context = useContext(StoreProviderContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
