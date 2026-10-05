"use client"

import { useState, useTransition } from "react"
import { shareCart, type ShareCartResult } from "@/app/share-actions"
import { shareUnavailableMessage } from "@/lib/messages"

function messageFor(result: ShareCartResult): string | null {
  switch (result.status) {
    case "shared":
      return null
    case "not-found":
      return "That cart is no longer saved."
    case "unavailable":
      return shareUnavailableMessage(result.reason)
    case "failed":
      return "Could not make a link. Try again."
  }
}

export function ShareCartButton({ handle }: { handle: string }) {
  const [result, setResult] = useState<ShareCartResult | null>(null)
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      try {
        setResult(await shareCart(handle))
      } catch {
        setResult({ status: "failed" })
      }
    })
  }

  const problem = result ? messageFor(result) : null

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {pending ? "Sharing…" : "Share"}
      </button>
      {result?.status === "shared" ? (
        <span className="text-xs text-green-700">
          Link made. It is under Share links.
        </span>
      ) : null}
      {problem ? (
        <span className="max-w-xs text-right text-xs text-red-600">
          {problem}
        </span>
      ) : null}
    </div>
  )
}
