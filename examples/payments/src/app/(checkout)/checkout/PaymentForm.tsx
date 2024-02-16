"use client";
import React from "react";
import { PaymentElement } from "@stripe/react-stripe-js";

export function PaymentForm() {
  return (
    <fieldset className="flex flex-col gap-6 self-stretch">
      <div>
        <legend className="text-2xl font-medium">Payment</legend>
      </div>
      <PaymentElement id="payment-element" />
    </fieldset>
  );
}
