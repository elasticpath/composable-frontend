"use client"

import { useEffect, useState, useTransition } from "react"
import { revokeShareLink } from "@/app/share-actions"
import { formatSharedDate, shareLinkUrl } from "@/lib/share-link"
import { shareUnavailableMessage } from "@/lib/share-unavailable-message"

type RowProps = {
  id: string
  token: string
  cartName: string | undefined
  sharedAt: string
}

export function ShareLinkRow({ id, token, cartName, sharedAt }: RowProps) {
  const [url, setUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setUrl(shareLinkUrl(window.location.origin, token))
  }, [token])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function revoke() {
    startTransition(async () => {
      try {
        const result = await revokeShareLink(id)
        if (result.status === "unavailable") {
          setProblem(shareUnavailableMessage(result.reason))
        } else if (result.status === "failed") {
          setProblem("Could not revoke the link. Try again.")
        }
      } catch {
        setProblem("Could not revoke the link. Try again.")
      }
    })
  }

  return (
    <li className="space-y-2 p-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-medium">{cartName ?? "Cart no longer saved"}</p>
        <p className="text-xs text-gray-500">
          Made {formatSharedDate(sharedAt)}
        </p>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          aria-label={`Link to share ${cartName ?? "this cart"}`}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded border border-gray-300 bg-gray-50 px-3 py-1.5 font-mono text-xs"
        />
        <button
          type="button"
          onClick={copy}
          disabled={!url}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={revoke}
          disabled={pending}
          className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50"
        >
          {pending ? "Revoking…" : "Revoke"}
        </button>
      </div>
      {problem ? <p className="text-xs text-red-600">{problem}</p> : null}
    </li>
  )
}
