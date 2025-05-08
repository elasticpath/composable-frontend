"use client"

import { forgotPassword } from "../../actions"
import { FormStatusButton, Input, Label } from "../../../components/ui"
import { useState } from "react"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | undefined>(undefined)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleForgotPassword(formData: FormData) {
    setIsLoading(true)
    const result = await forgotPassword(formData)
    setIsLoading(false)

    if (result && "error" in result) {
      setError(result.error)
      setSuccess(false)
    } else if (result && "success" in result) {
      setSuccess(true)
      setError(undefined)
    }
  }

  // Show success message after form submission
  if (success) {
    return (
      <div className="p-4 mb-4 text-sm rounded-lg bg-green-50 text-green-800">
        <p className="font-medium">Password reset email sent!</p>
        <p className="mt-2">
          If an account exists with that email, we've sent instructions to reset
          your password. Please check your inbox.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Return to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form className="space-y-6" action={handleForgotPassword}>
      <div>
        <Label htmlFor="email">Email address</Label>
        <div className="mt-2">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email address"
          />
        </div>
      </div>

      {error && (
        <div className="mt-2">
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}

      <div>
        <FormStatusButton isLoading={isLoading}>
          Send reset instructions
        </FormStatusButton>
      </div>
    </form>
  )
}
