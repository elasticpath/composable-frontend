"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

export function SaveButton({
  productId,
  savedEntryId,
}: {
  productId: string
  savedEntryId: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    setError(null)

    const response = savedEntryId
      ? await fetch(`/api/saved-list/${savedEntryId}`, { method: "DELETE" })
      : await fetch("/api/saved-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        })

    if (!response.ok) {
      setError("That did not work. Try again.")
      return
    }

    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={toggle}
        className={
          savedEntryId
            ? "rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50"
            : "rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        }
      >
        {savedEntryId ? "Remove" : "Save"}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
