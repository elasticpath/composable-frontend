"use client"

import { login } from "../../actions"
import { useState } from "react"
import Link from "next/link"

export function LoginForm({ returnUrl }: { returnUrl?: string }) {
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  async function loginAction(formData: FormData) {
    setIsLoading(true)
    const result = await login(formData)
    setIsLoading(false)

    if (result && "error" in result) {
      setError(result.error)
    }
  }

  return (
    <form className="space-y-6" action={loginAction}>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Email address
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Password
          </label>
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-semibold text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {returnUrl && (
        <input
          id="returnUrl"
          readOnly
          name="returnUrl"
          type="text"
          className="hidden"
          value={returnUrl}
        />
      )}

      {error && (
        <div className="mt-2">
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  )
}
