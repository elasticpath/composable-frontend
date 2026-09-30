"use client"

import { useState } from "react"
import { login } from "../actions"

export function LoginForm({ returnUrl }: { returnUrl?: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    setError(null)

    const result = await login(formData)
    setError(result?.error ?? null)
    setPending(false)
  }

  return (
    <form action={onSubmit} className="space-y-4">
      {returnUrl ? (
        <input type="hidden" name="returnUrl" value={returnUrl} />
      ) : null}

      <label className="block space-y-1">
        <span className="text-sm text-gray-700">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-gray-700">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}
