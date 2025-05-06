"use client"

import { useState } from "react"
import { login } from "../actions"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import Link from "next/link"

interface LoginFormProps {
  returnUrl?: string
}

export function LoginForm({ returnUrl }: LoginFormProps) {
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(undefined)

    try {
      const result = await login(formData)
      if ("error" in result) {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-6" action={handleSubmit}>
      <div>
        <Label htmlFor="email" required>
          Email address
        </Label>
        <div className="mt-2">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            error={!!error}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password" required>
            Password
          </Label>
        </div>
        <div className="mt-2">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            error={!!error}
          />
        </div>
      </div>

      {returnUrl && (
        <input
          id="returnUrl"
          name="returnUrl"
          type="hidden"
          value={returnUrl}
        />
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>
      </div>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Register
        </Link>
      </div>
    </form>
  )
}
