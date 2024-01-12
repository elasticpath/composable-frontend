"use client";

import React, { createContext, useContext, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import {
  CheckoutForm,
  checkoutFormSchema,
} from "../../../components/checkout/form-schema/checkout-form-schema";
import {
  CartState,
  useAuthedAccountMember,
  useCart,
} from "@elasticpath/react-shopper-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../../../components/form/Form";
import { ShippingMethod, useShippingMethod } from "./useShippingMethod";
import { usePaymentComplete } from "./usePaymentComplete";
import { loadStripe } from "@stripe/stripe-js/pure";
loadStripe.setLoadParameters({
  advancedFraudSignals: process.env.NODE_ENV === "test" ? false : true,
});
import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { epPaymentsEnvData } from "../../../lib/resolve-ep-stripe-env";
import { EP_CURRENCY_CODE } from "../../../lib/resolve-ep-currency-code";

const stripePromise = loadStripe(epPaymentsEnvData.publishableKey, {
  stripeAccount: epPaymentsEnvData.accountId,
});

type CheckoutContext = {
  cart?: CartState;
  isLoading: boolean;
  completePayment: ReturnType<typeof usePaymentComplete>;
  isCompleting: boolean;
  confirmationData: ReturnType<typeof usePaymentComplete>["data"];
  shippingMethods: {
    options?: ShippingMethod[];
    isLoading: boolean;
  };
};

const CheckoutContext = createContext<CheckoutContext | null>(null);

type CheckoutProviderProps = {
  children?: React.ReactNode;
};

export function StripeCheckoutProvider({ children }: CheckoutProviderProps) {
  const { state, useClearCart } = useCart();

  const { mutateAsync: mutateClearCart } = useClearCart();

  const [confirmationData, setConfirmationData] =
    useState<ReturnType<typeof usePaymentComplete>["data"]>(undefined);

  const formMethods = useForm<CheckoutForm>({
    reValidateMode: "onChange",
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      sameAsShipping: true,
      shippingMethod: "__shipping_standard",
    },
  });

  const { selectedAccountToken } = useAuthedAccountMember();

  const { data: shippingMethods, isLoading: isShippingMethodsLoading } =
    useShippingMethod();

  const paymentComplete = usePaymentComplete(
    {
      cartId: state?.id,
      accountToken: selectedAccountToken?.token,
    },
    {
      onSuccess: async (data) => {
        setConfirmationData(data);
        state?.id &&
          (await mutateClearCart({
            cartId: state.id,
          }));
      },
    },
  );

  return (
    <Form {...formMethods}>
      <CheckoutContext.Provider
        value={{
          shippingMethods: {
            options: shippingMethods,
            isLoading: isShippingMethodsLoading,
          },
          confirmationData,
          isLoading: false,
          cart: state,
          completePayment: paymentComplete,
          isCompleting: paymentComplete.isPending,
        }}
      >
        {children}
      </CheckoutContext.Provider>
    </Form>
  );
}

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  const { state } = useCart();

  const options: StripeElementsOptions = {
    mode: "payment",
    currency: EP_CURRENCY_CODE.toLowerCase(),
    amount:
      state?.meta?.display_price?.with_tax?.amount &&
      state?.meta?.display_price?.with_tax?.amount > 0
        ? state?.meta?.display_price?.with_tax?.amount
        : 100,
    capture_method: "automatic",
    payment_method_types: ["card"],
    appearance: {
      theme: "stripe",
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <StripeCheckoutProvider>{children}</StripeCheckoutProvider>
    </Elements>
  );
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  const form = useFormContext<CheckoutForm>();
  if (context === null) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return { ...context, ...form };
};
