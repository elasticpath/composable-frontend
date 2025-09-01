"use client";

import { ReactNode, useEffect } from "react";
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
  const router = useRouter();

  useEffect(() => {
    if ((cartResponse.included?.items?.length ?? 0) < 1) {
      router.push("/cart");
    }
  }, [cartResponse, router]);

  if ((cartResponse.included?.items?.length ?? 0) < 1) {
    return null;
  }

  return children;
}
