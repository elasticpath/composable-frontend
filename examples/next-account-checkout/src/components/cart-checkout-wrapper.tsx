"use client"

import { useState } from "react"
import { CartView } from "./cart-view"
import { CheckoutView } from "./checkout-view"

interface CartCheckoutWrapperProps {
  isUserAuthenticated: boolean
}

export function CartCheckoutWrapper({
  isUserAuthenticated,
}: CartCheckoutWrapperProps) {
  const [step, setStep] = useState<"cart" | "checkout">("cart")

  if (step === "cart") {
    return <CartView onCheckout={() => setStep("checkout")} />
  }

  return (
    <CheckoutView
      onBack={() => setStep("cart")}
      isUserAuthenticated={isUserAuthenticated}
    />
  )
}
