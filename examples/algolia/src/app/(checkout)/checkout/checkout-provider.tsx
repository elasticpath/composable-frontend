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
  useCartClear,
} from "@elasticpath/react-shopper-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../../../components/form/Form";
import { ShippingMethod, useShippingMethod } from "./useShippingMethod";
import { usePaymentComplete } from "./usePaymentComplete";

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

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  const { data } = useCart();

  const state = data?.state;

  const { mutateAsync: mutateClearCart } = useCartClear();

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
        await mutateClearCart();
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

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  const form = useFormContext<CheckoutForm>();
  if (context === null) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return { ...context, ...form };
};
