import React from "react";
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import EpStripePaymentForm from "./EpStripePaymentForm";
import { epPaymentsEnvData } from "../../../lib/resolve-ep-stripe-env";
import styles from "./EpStripePayment.module.css";
import clsx from "clsx";

const stripePromise = loadStripe(epPaymentsEnvData.publishableKey, {
  stripeAccount: epPaymentsEnvData.accountId,
});

export default function EpStripePayment({
  clientSecret,
  showCompletedOrder,
}: {
  clientSecret: string;
  showCompletedOrder: () => void;
}) {
  const appearance: Appearance = {
    theme: "stripe",
  };
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <div className={clsx(styles.stripe, "md:min-w-[30rem]")}>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <EpStripePaymentForm showCompletedOrder={showCompletedOrder} />
        </Elements>
      )}
    </div>
  );
}
