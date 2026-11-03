"use client"

import Link from "next/link"
import { useState, useTransition, type FormEvent } from "react"
import { saveCartForLater, type SaveCartResult } from "@/app/cart-actions"

const MESSAGES = {
  "nothing-to-save": "There is nothing in your cart to save.",
  failed: "Could not save the cart. Try again.",
} as const

export function SaveForLaterForm() {
  const [result, setResult] = useState<SaveCartResult | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const name = String(new FormData(form).get("name") ?? "")

    startTransition(async () => {
      try {
        const saved = await saveCartForLater(name)
        setResult(saved)
        if (saved.status === "saved") form.reset()
      } catch {
        setResult({ status: "failed" })
      }
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded border border-gray-200 bg-white p-4"
    >
      <label htmlFor="cart-name" className="block text-sm font-medium">
        Save this cart for later
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id="cart-name"
          name="name"
          type="text"
          required
          maxLength={255}
          placeholder="Name this cart"
          className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save for later"}
        </button>
      </div>

      {result?.status === "saved" ? (
        <p className="mt-2 text-sm text-green-700">
          Saved as {result.name}. You have a new empty cart.{" "}
          <Link href="/saved-carts" className="underline">
            See saved carts
          </Link>
        </p>
      ) : null}
      {result?.status === "invalid-name" ? (
        <p className="mt-2 text-sm text-red-600">{result.problem}</p>
      ) : null}
      {result?.status === "nothing-to-save" || result?.status === "failed" ? (
        <p className="mt-2 text-sm text-red-600">{MESSAGES[result.status]}</p>
      ) : null}
    </form>
  )
}
