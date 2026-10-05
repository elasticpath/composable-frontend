"use client"

import { useOptimistic, useState, useTransition, type FormEvent } from "react"
import { renameSavedCartAction } from "@/app/saved-cart-actions"
import { NOT_ANSWERING_MESSAGE } from "@/lib/cart-messages"

export function SavedCartName({
  handle,
  name,
}: {
  handle: string
  name: string
}) {
  const [shownName, showName] = useOptimistic(name)
  const [editing, setEditing] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const requested = String(
      new FormData(event.currentTarget).get("name") ?? "",
    )

    setProblem(null)
    setEditing(false)
    startTransition(async () => {
      showName(requested.trim())
      try {
        const result = await renameSavedCartAction(handle, requested)
        if (result.status === "failed") {
          setProblem(result.message)
          setEditing(true)
        }
      } catch {
        setProblem(NOT_ANSWERING_MESSAGE)
        setEditing(true)
      }
    })
  }

  if (editing) {
    return (
      <form onSubmit={onSubmit} className="space-y-1">
        <div className="flex gap-2">
          <input
            name="name"
            type="text"
            required
            maxLength={255}
            defaultValue={shownName}
            aria-label="Cart name"
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-blue-600 px-2 py-1 text-sm text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setProblem(null)
            }}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            Cancel
          </button>
        </div>
        {problem ? <p className="text-sm text-red-600">{problem}</p> : null}
      </form>
    )
  }

  return (
    <div>
      <p className="flex items-center gap-2 font-medium">
        {shownName}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs font-normal text-blue-600 underline"
        >
          Rename
        </button>
      </p>
      {problem ? <p className="text-sm text-red-600">{problem}</p> : null}
    </div>
  )
}
