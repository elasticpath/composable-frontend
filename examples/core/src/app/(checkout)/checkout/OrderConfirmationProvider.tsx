"use client";
import type { paymentComplete, PaymentCompleteResponse } from "./actions";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type OrderConfirmationContext = {
  confirmationData: PaymentCompleteResponse | undefined;
  setConfirmationData: Dispatch<
    SetStateAction<PaymentCompleteResponse | undefined>
  >;
};

const OrderConfirmationContext = createContext<OrderConfirmationContext | null>(
  null,
);

export function OrderConfirmationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [confirmationData, setConfirmationData] = useState<
    Awaited<ReturnType<typeof paymentComplete>> | undefined
  >(undefined);

  return (
    <OrderConfirmationContext.Provider
      value={{ confirmationData, setConfirmationData }}
    >
      {children}
    </OrderConfirmationContext.Provider>
  );
}

export function useOrderConfirmation() {
  const context = useContext(OrderConfirmationContext);
  if (!context) {
    throw new Error(
      "useOrderConfirmation must be used within a OrderConfirmationProvider",
    );
  }
  return context.confirmationData;
}

export function useSetOrderConfirmation() {
  const context = useContext(OrderConfirmationContext);
  if (!context) {
    throw new Error(
      "useOrderConfirmation must be used within a OrderConfirmationProvider",
    );
  }
  return context.setConfirmationData;
}
