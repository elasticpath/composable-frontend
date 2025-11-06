"use client";

import { ReactNode, useEffect } from "react";
import { OrderConfirmation } from "./OrderConfirmation";
import { useOrderConfirmation } from "./OrderConfirmationProvider";
import { useRouter } from "next/navigation";
import { getACart, ResponseCurrency } from "@epcc-sdk/sdks-shopper";

export function CheckoutViews({
  children,
  cartResponse,
  currencies,
}: {
  children: ReactNode;
  currencies: ResponseCurrency[];
  cartResponse: NonNullable<Awaited<ReturnType<typeof getACart>>["data"]>;
}) {
  const confirmationData = useOrderConfirmation();
  const router = useRouter();

  useEffect(() => {
    if (!confirmationData && (cartResponse.included?.items?.length ?? 0) < 1) {
      router.push("/cart");
    }
  }, [cartResponse]);

  if (!confirmationData && (cartResponse.included?.items?.length ?? 0) < 1) {
    return null;
  }

  if (confirmationData) {
    return (
      <OrderConfirmation
        confirmationData={confirmationData}
        currencies={currencies}
      />
    );
  }

  return children;
}
