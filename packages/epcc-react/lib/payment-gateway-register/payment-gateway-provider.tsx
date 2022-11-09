import { createContext, ReactNode, useReducer } from "react";
import { PGRAction, PGRState } from "./types/payment-gateway-reducer-types";
import { pgrReducer } from "./payment-gateway-reducer";

export const PGRContext = createContext<
  { state: PGRState; dispatch: (action: PGRAction) => void } | undefined
>(undefined);

interface PGRProviderProps {
  children: ReactNode;
}

export function PGRProvider({ children }: PGRProviderProps) {
  const [state, dispatch] = useReducer(pgrReducer, {
    kind: "uninitialized-payment-gateway-register-state",
  });

  return (
    <PGRContext.Provider value={{ state, dispatch }}>
      {children}
    </PGRContext.Provider>
  );
}
