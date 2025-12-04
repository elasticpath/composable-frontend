"use client";

import React, { createContext, useContext, useTransition } from "react";
import { useForm, useFormContext } from "react-hook-form";
import {
  AccountMemberCheckoutForm,
  accountMemberCheckoutFormSchema,
  CheckoutForm,
  NonAccountCheckoutForm,
  nonAccountCheckoutFormSchema,
} from "src/components/checkout/form-schema/checkout-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "src/components/form/Form";
import { ShippingMethod, staticDeliveryMethods } from "./useShippingMethod";
import { getACart } from "@epcc-sdk/sdks-shopper";
import { paymentComplete } from "./actions";
import { useSetOrderConfirmation } from "./OrderConfirmationProvider";
import { useParams } from "next/navigation";

type CheckoutContext = {
  cart?: NonNullable<Awaited<ReturnType<typeof getACart>>["data"]>;
  completePayment: (data: CheckoutForm) => Promise<void>;
  isCompleting: boolean;
  shippingMethods: {
    options?: ShippingMethod[];
  };
};

const CheckoutContext = createContext<CheckoutContext | null>(null);

type CheckoutProviderProps = {
  children?: React.ReactNode;
  type: "subscription" | "guest";
};

const guestFormDefaults = {
  type: "guest",
  guest: {
    email: "",
    createAccount: false,
  },
  shippingAddress: {
    // Shipping specific fields
    phone_number: "",
    instructions: "",
    // Billing address fields (merged into shippingAddress)
    first_name: "",
    last_name: "",
    company_name: "",
    line_1: "",
    line_2: "",
    city: "",
    county: "",
    region: "",
    postcode: "",
    country: "",
  },
  sameAsShipping: true,
  shippingMethod: "__shipping_standard",
} as const;

const subscriptionFormDefaults = {
  type: "subscription",
  guest: {
    email: "",
    createAccount: true,
  },
  shippingAddress: {
    // Shipping specific fields
    phone_number: "",
    instructions: "",
    // Billing address fields (merged into shippingAddress)
    first_name: "",
    last_name: "",
    company_name: "",
    line_1: "",
    line_2: "",
    city: "",
    county: "",
    region: "",
    postcode: "",
    country: "",
  },
  sameAsShipping: true,
  shippingMethod: "__shipping_standard",
} as const;

const accountFormDefaults = {
  type: "account",
  account: {
    email: "",
    name: "",
  },
  shippingAddress: {
    // Shipping specific fields
    phone_number: "",
    instructions: "",
    // Billing address fields (merged into shippingAddress)
    first_name: "",
    last_name: "",
    company_name: "",
    line_1: "",
    line_2: "",
    city: "",
    county: "",
    region: "",
    postcode: "",
    country: "",
  },
  sameAsShipping: true,
  shippingMethod: "__shipping_standard",
} as const;

export function GuestCheckoutProvider({
  children,
  type,
}: CheckoutProviderProps) {
  const { lang } = useParams();
  const [isPending, startTransition] = useTransition();
  const setConfirmationData = useSetOrderConfirmation();

  const formMethods = useForm<NonAccountCheckoutForm>({
    defaultValues:
      type === "subscription" ? subscriptionFormDefaults : guestFormDefaults,
    resolver: zodResolver(nonAccountCheckoutFormSchema),
  });

  async function handleSubmit(data: CheckoutForm) {
    startTransition(async () => {
      const result = await paymentComplete(data, lang as string);
      setConfirmationData(result);
    });
  }

  return (
    <Form {...formMethods}>
      <CheckoutContext.Provider
        value={{
          shippingMethods: {
            options: staticDeliveryMethods,
          },
          completePayment: handleSubmit,
          isCompleting: isPending,
        }}
      >
        {children}
      </CheckoutContext.Provider>
    </Form>
  );
}

export function AccountCheckoutProvider({
  children,
}: Omit<CheckoutProviderProps, "type">) {
  const { lang } = useParams();
  const [isPending, startTransition] = useTransition();
  const setConfirmationData = useSetOrderConfirmation();

  const formMethods = useForm<AccountMemberCheckoutForm>({
    defaultValues: accountFormDefaults,
    resolver: zodResolver(accountMemberCheckoutFormSchema),
  });

  async function handleSubmit(data: CheckoutForm) {
    startTransition(async () => {
      const result = await paymentComplete(data, lang as string);
      setConfirmationData(result);
    });
  }

  return (
    <Form {...formMethods}>
      <CheckoutContext.Provider
        value={{
          shippingMethods: {
            options: staticDeliveryMethods,
          },
          completePayment: handleSubmit,
          isCompleting: isPending,
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
