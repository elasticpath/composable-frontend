"use client"

import { useActionState, useId, useState } from "react"
import { addSeats } from "@/app/actions"
import { selectSeats, type SeatProduct } from "@/lib/seat-rules"

type SeatControlProps = {
  productId: string
  product: SeatProduct
  contactUrl: string
}

export function SeatControl({
  productId,
  product,
  contactUrl,
}: SeatControlProps) {
  const [requested, setRequested] = useState("1")
  const [typed, setTyped] = useState("1")
  const [state, formAction, pending] = useActionState(addSeats, null)
  const inputId = useId()
  const hintId = useId()

  const selection = selectSeats(product, requested)
  const { limit, seats, overLimit, total } = selection
  const seatWord = seats === 1 ? "seat" : "seats"

  function request(value: string) {
    setRequested(value)
    setTyped(selectSeats(product, value).overLimit ? String(limit) : value)
  }

  function settleTypedValue() {
    if (overLimit) return
    setRequested(String(seats))
    setTyped(String(seats))
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="seats" value={seats} />

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Seats</legend>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={limit}
            step={1}
            value={seats}
            onChange={(event) => request(event.target.value)}
            aria-label="Seats"
            aria-valuetext={`${seats} of ${limit} seats`}
            aria-describedby={hintId}
            className="h-2 min-w-0 flex-1 cursor-pointer accent-blue-600"
          />
          <label htmlFor={inputId} className="sr-only">
            Number of seats
          </label>
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={1}
            max={limit}
            step={1}
            value={typed}
            onChange={(event) => request(event.target.value)}
            onBlur={settleTypedValue}
            aria-describedby={hintId}
            className="w-20 rounded border border-gray-300 px-2 py-1 text-right tabular-nums"
          />
        </div>
        <p id={hintId} className="text-xs text-gray-500">
          1 to {limit} seats
        </p>
      </fieldset>

      <p aria-live="polite" className="text-lg">
        <span className="tabular-nums">{seats}</span> {seatWord}:{" "}
        <span className="font-semibold tabular-nums">
          {total?.formatted ?? "No price"}
        </span>
      </p>

      {overLimit ? (
        <div
          role="status"
          className="rounded border border-amber-300 bg-amber-50 p-4 text-sm"
        >
          <p>
            Orders above {limit} seats go through customer service, so they
            cannot be added to the cart here.
          </p>
          <a
            href={contactUrl}
            className="mt-2 inline-block font-medium text-blue-700 underline"
          >
            Contact customer service
          </a>
        </div>
      ) : (
        <button
          type="submit"
          disabled={pending || !total}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Adding…" : `Add ${seats} ${seatWord} to cart`}
        </button>
      )}

      {state?.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
