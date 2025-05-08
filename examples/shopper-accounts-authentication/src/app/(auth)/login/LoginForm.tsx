"use client"

import { login } from "../../actions"
import { FormStatusButton, Input, Label } from "../../../components/ui"
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
        <Label htmlFor="email">Email address</Label>
        <div className="mt-2">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
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
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
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
        <FormStatusButton isLoading={isLoading}>Sign in</FormStatusButton>
      </div>
    </form>
  )
}
