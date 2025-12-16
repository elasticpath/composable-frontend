"use client";

import { useCheckout } from "./checkout-provider";
import { StatusButton } from "src/components/button/StatusButton";
import { CartResponse, ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { getShippingMethods, ShippingMethod } from "./useShippingMethod";
import { useWatch } from "react-hook-form";
import { useParams } from "next/navigation";
import { getPreferredCurrency } from "src/lib/i18n";
import { resolveTotalInclShipping } from "src/components/checkout-sidebar/ItemSidebar";

export function SubmitCheckoutButton({
  cart,
  currencies,
  shippingMethods,
  hasPhysical,
}: {
  cart: CartResponse
  currencies: ResponseCurrency[]
  shippingMethods: ShippingMethod[]
  hasPhysical: boolean
}) {
  const { handleSubmit, completePayment, isCompleting } = useCheckout();

  const { lang } = useParams();
  const cartCurrencyCode = cart.meta?.display_price?.with_tax?.currency;
  const storeCurrency = getPreferredCurrency(lang as string, currencies, cartCurrencyCode);
  
  const shippingMethod = useWatch({ name: "shippingMethod" });
  const shippingAmount = hasPhysical ? shippingMethods.find(
    (method) => method.value === shippingMethod,
  )?.amount : 0;

  const formattedTotalAmountInclShipping =
    cart.meta?.display_price?.with_tax?.amount !== undefined &&
    shippingAmount !== undefined &&
    storeCurrency
      ? resolveTotalInclShipping(
          shippingAmount,
          cart.meta.display_price.with_tax.amount,
          storeCurrency,
        )
      : cart.meta?.display_price?.with_tax?.formatted;

  return (
    <StatusButton
      type="button"
      className="w-full h-16"
      status={isCompleting ? "loading" : "idle"}
      onClick={handleSubmit((values) => {
        return completePayment(values);
      })}
    >
      {`Pay ${formattedTotalAmountInclShipping}`}
    </StatusButton>
  );
}
