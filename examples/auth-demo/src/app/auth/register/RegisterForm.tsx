"use client"

import { useState } from "react"
import { register } from "../actions"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import Link from "next/link"

export function RegisterForm() {
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(undefined)

    try {
      const result = await register(formData)
      if (result && "error" in result) {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-6" action={handleSubmit}>
      <div>
        <Label htmlFor="name" required>
          Full Name
        </Label>
        <div className="mt-2">
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            error={!!error}
          />
        </div>
      </div>

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
        <Label htmlFor="password" required>
          Password
        </Label>
        <div className="mt-2">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            error={!!error}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign in
        </Link>
      </div>
    </form>
  )
}
