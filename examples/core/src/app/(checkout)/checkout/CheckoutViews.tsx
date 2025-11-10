"use client";

import { useCheckout } from "./checkout-provider";
import { ReactNode } from "react";
import { OrderConfirmation } from "./OrderConfirmation";

export function CheckoutViews({ children }: { children: ReactNode }) {
  const { confirmationData } = useCheckout();

  if (confirmationData) {
    return <OrderConfirmation />;
  }

  return children;
}
