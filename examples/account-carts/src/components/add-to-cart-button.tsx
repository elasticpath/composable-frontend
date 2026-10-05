"use client"

import { useState, useTransition } from "react"
import { addToCart } from "@/app/cart-actions"

type ButtonState = "idle" | "added" | "failed"

export function AddToCartButton({ productId }: { productId: string }) {
  const [state, setState] = useState<ButtonState>("idle")
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      try {
        const result = await addToCart(productId)
        setState(result.status)
      } catch {
        setState("failed")
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add to cart"}
      </button>
      {state === "added" ? (
        <span className="text-xs text-green-700">Added to your cart</span>
      ) : null}
      {state === "failed" ? (
        <span className="text-xs text-red-600">
          Could not add it. Try again.
        </span>
      ) : null}
    </div>
  )
}
