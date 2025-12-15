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
import { getShippingMethods, ShippingMethod } from "./useShippingMethod";
import { getACart, ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { paymentComplete } from "./actions";
import { useSetOrderConfirmation } from "./OrderConfirmationProvider";
import { useParams } from "next/navigation";
import { getPreferredCurrency } from "src/lib/i18n";

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
  cart?: NonNullable<Awaited<ReturnType<typeof getACart>>["data"]>;
  currencies?: ResponseCurrency[];
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
  cart,
  currencies = [],
}: CheckoutProviderProps) {
  const { lang } = useParams();
  const cartCurrencyCode = cart?.data?.meta?.display_price?.with_tax?.currency;
  const storeCurrency = getPreferredCurrency(lang as string, currencies, cartCurrencyCode);
  const [isPending, startTransition] = useTransition();
  const setConfirmationData = useSetOrderConfirmation();
  const shippingMethods = getShippingMethods(cart, storeCurrency);

  const formMethods = useForm<NonAccountCheckoutForm>({
    defaultValues:
      type === "subscription" ? subscriptionFormDefaults : guestFormDefaults,
    resolver: zodResolver(nonAccountCheckoutFormSchema),
  });

  async function handleSubmit(data: CheckoutForm) {
    startTransition(async () => {
      const result = await paymentComplete(data, lang as string, storeCurrency?.code, shippingMethods);
      setConfirmationData(result);
    });
  }

  return (
    <Form {...formMethods}>
      <CheckoutContext.Provider
        value={{
          shippingMethods: {
            options: shippingMethods,
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
  cart,
  currencies = [],
}: Omit<CheckoutProviderProps, "type">) {
  const { lang } = useParams();
  const cartCurrencyCode = cart?.data?.meta?.display_price?.with_tax?.currency;
  const storeCurrency = getPreferredCurrency(lang as string, currencies, cartCurrencyCode);
  const [isPending, startTransition] = useTransition();
  const setConfirmationData = useSetOrderConfirmation();
  const shippingMethods = getShippingMethods(cart, storeCurrency);

  const formMethods = useForm<AccountMemberCheckoutForm>({
    defaultValues: accountFormDefaults,
    resolver: zodResolver(accountMemberCheckoutFormSchema),
  });

  async function handleSubmit(data: CheckoutForm) {
    startTransition(async () => {
      const result = await paymentComplete(data, lang as string, storeCurrency?.code, shippingMethods);
      setConfirmationData(result);
    });
  }

  return (
    <Form {...formMethods}>
      <CheckoutContext.Provider
        value={{
          shippingMethods: {
            options: shippingMethods,
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
