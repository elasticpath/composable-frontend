"use client"

import { useState, useTransition } from "react"
import { addToCart } from "@/app/cart-actions"
import { NOT_ANSWERING_MESSAGE } from "@/lib/cart-messages"

type ButtonState =
  | { status: "idle" }
  | { status: "added" }
  | { status: "failed"; message: string }

export function AddToCartButton({ productId }: { productId: string }) {
  const [state, setState] = useState<ButtonState>({ status: "idle" })
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      try {
        const result = await addToCart(productId)
        setState(result)
      } catch {
        setState({ status: "failed", message: NOT_ANSWERING_MESSAGE })
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
      {state.status === "added" ? (
        <span className="text-xs text-green-700">Added to your cart</span>
      ) : null}
      {state.status === "failed" ? (
        <span className="max-w-48 text-right text-xs text-red-600">
          {state.message}
        </span>
      ) : null}
    </div>
  )
}
