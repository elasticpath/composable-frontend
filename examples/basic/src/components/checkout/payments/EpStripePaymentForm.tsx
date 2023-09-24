import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@elasticpath/react-shopper-hooks";

export default function EpStripePaymentForm({
  showCompletedOrder,
}: {
  showCompletedOrder: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { emptyCart } = useCart();

  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret",
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error?.type === "card_error" || error?.type === "validation_error") {
      setMessage(error?.message || "");
    } else {
      setMessage("An unexpected error occurred.");
    }
    setIsLoading(false);
    if (error) {
      return;
    }
    await emptyCart();
    showCompletedOrder();
  };

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
      style={{ maxWidth: "600px" }}
    >
      {message && (
        <span className="pt-3 text-center text-lg text-red-600">{message}</span>
      )}
      <PaymentElement id="payment-element" />
      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
    </form>
  );
}
