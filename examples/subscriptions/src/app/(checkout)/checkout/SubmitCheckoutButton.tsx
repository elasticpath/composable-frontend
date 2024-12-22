"use client";

import { useCheckout } from "./checkout-provider";
import { useCart } from "@elasticpath/react-shopper-hooks";
import { StatusButton } from "../../../components/button/StatusButton";

export function SubmitCheckoutButton() {
  const { handleSubmit, completePayment, isCompleting } = useCheckout();
  const { data } = useCart();

  const state = data?.state;

  if (!state) {
    return null;
  }

  return (
    <StatusButton
      type="button"
      className="w-full h-16"
      status={isCompleting ? "loading" : "idle"}
      onClick={handleSubmit((values) => {
        completePayment.mutate({ data: values });
      })}
    >
      {`Pay ${state.meta?.display_price?.with_tax?.formatted}`}
    </StatusButton>
  );
}
