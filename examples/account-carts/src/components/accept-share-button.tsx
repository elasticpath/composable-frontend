"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import {
  acceptSharedCart,
  type AcceptShareResult,
} from "@/app/accept-share-action"
import { COULD_NOT_CONFIRM_MERGE_MESSAGE } from "@/lib/merge-failure-messages"

export function AcceptShareButton({ token }: { token: string }) {
  const [result, setResult] = useState<AcceptShareResult | null>(null)
  const [unconfirmed, setUnconfirmed] = useState(false)
  const [pending, startTransition] = useTransition()

  function onClick() {
    setResult(null)
    setUnconfirmed(false)
    startTransition(async () => {
      try {
        const outcome = await acceptSharedCart(token)
        setResult(outcome)
      } catch {
        setUnconfirmed(true)
      }
    })
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add these items to my cart"}
      </button>

      {unconfirmed ? (
        <p className="text-sm text-red-600">
          {COULD_NOT_CONFIRM_MERGE_MESSAGE}
        </p>
      ) : null}

      {result?.status === "unavailable" ? (
        <p className="text-sm text-red-600">{result.message}</p>
      ) : null}

      {result?.status === "already-active" ? (
        <p className="text-sm text-gray-700">
          This is already your active cart, so there is nothing to add.{" "}
          <Link href="/cart" className="text-blue-600 underline">
            Open your cart
          </Link>
        </p>
      ) : null}

      {result?.status === "failed" ? (
        <div className="space-y-1 text-sm text-red-600">
          <p>{result.failure.summary}</p>
          {result.failure.problems.length > 0 ? (
            <ul className="list-disc pl-5">
              {result.failure.problems.map((problem, index) => (
                <li key={index}>{problem}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
