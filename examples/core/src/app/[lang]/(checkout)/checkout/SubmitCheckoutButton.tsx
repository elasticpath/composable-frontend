"use client";

import { useCheckout } from "./checkout-provider";
import { StatusButton } from "src/components/button/StatusButton";
import { CartResponse } from "@epcc-sdk/sdks-shopper";

export function SubmitCheckoutButton({ cart }: { cart: CartResponse }) {
  const { handleSubmit, completePayment, isCompleting } = useCheckout();

  return (
    <StatusButton
      type="button"
      className="w-full h-16"
      status={isCompleting ? "loading" : "idle"}
      onClick={handleSubmit((values) => {
        return completePayment(values);
      })}
    >
      {`Pay ${cart.meta?.display_price?.with_tax?.formatted}`}
    </StatusButton>
  );
}
