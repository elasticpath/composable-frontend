"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import {
  deleteSavedCartAction,
  resumeSavedCartAction,
} from "@/app/saved-cart-actions"
import { NOT_ANSWERING_MESSAGE } from "@/lib/cart-messages"

export function SavedCartActions({ handle }: { handle: string }) {
  const router = useRouter()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function resume() {
    setProblem(null)
    startTransition(async () => {
      try {
        const result = await resumeSavedCartAction(handle)
        if (result.status === "failed") {
          setProblem(result.message)
          return
        }
        router.push("/cart")
      } catch {
        setProblem(NOT_ANSWERING_MESSAGE)
      }
    })
  }

  function remove() {
    setProblem(null)
    startTransition(async () => {
      try {
        const result = await deleteSavedCartAction(handle)
        if (result.status === "failed") {
          setProblem(result.message)
        }
      } catch {
        setProblem(NOT_ANSWERING_MESSAGE)
      }
      setConfirmingDelete(false)
    })
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={resume}
          disabled={pending}
          className="rounded bg-blue-600 px-2 py-1 text-sm text-white disabled:opacity-50"
        >
          Resume
        </button>
        {confirmingDelete ? (
          <>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="rounded bg-red-600 px-2 py-1 text-sm text-white disabled:opacity-50"
            >
              Confirm delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={pending}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={pending}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            Delete
          </button>
        )}
      </div>
      {problem ? <p className="text-sm text-red-600">{problem}</p> : null}
    </div>
  )
}
