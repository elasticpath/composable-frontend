"use client";

import { useCheckout } from "./checkout-provider";
import { useCart } from "@elasticpath/react-shopper-hooks";
import { StatusButton } from "../../../components/button/StatusButton";
import { useWatch } from "react-hook-form";


import { useShippingMethod} from "./useShippingMethod";


export function SubmitCheckoutButton() {
  const { handleSubmit, completePayment, isCompleting } = useCheckout();
  const { data } = useCart();
  const shippingMethod = useWatch({ name: "shippingMethod" });
  const state = data?.state;
  
  const staticDeliveryMethods = useShippingMethod(state?.id).data;
  

  if (!state) {
    return null;
  }
  const shippingAmount = staticDeliveryMethods?.find(
    (method) => method.value === shippingMethod,
  )?.amount;
  const cartTotal = state.meta?.display_price?.with_tax?.amount
  const amountIncludingShipping = ((cartTotal ?? 0) + (shippingAmount ?? 0)) / 100

  return (
    <StatusButton
      type="button"
      className="w-full h-16"
      status={isCompleting ? "loading" : "idle"}
      onClick={handleSubmit((values) => {
        completePayment.mutate({ data: values });
      })}
    >
      {`Pay ${Intl.NumberFormat("en-US", { minimumSignificantDigits: 2 }).format(amountIncludingShipping)}`}
    </StatusButton>
  );
}
