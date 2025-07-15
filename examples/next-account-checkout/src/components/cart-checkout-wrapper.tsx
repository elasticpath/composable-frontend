"use client"

import { useState } from "react"
import { CartView } from "./cart-view"
import { CheckoutView } from "./checkout-view"

export function CartCheckoutWrapper() {
  const [step, setStep] = useState<"cart" | "checkout">("cart")

  if (step === "cart") {
    return <CartView onCheckout={() => setStep("checkout")} />
  }

  return <CheckoutView onBack={() => setStep("cart")} />
}
