"use client"

import { resetPassword } from "../../actions"
import { FormStatusButton, Input, Label } from "../../../components/ui"
import { useState } from "react"
import Link from "next/link"

interface ResetPasswordFormProps {
  token: string
  email: string
  profileInfoId: string
}

export function ResetPasswordForm({
  token,
  email,
  profileInfoId,
}: ResetPasswordFormProps) {
  const [error, setError] = useState<string | undefined>(undefined)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleResetPassword(formData: FormData) {
    setIsLoading(true)

    // Add hidden fields to form data
    formData.append("token", token)
    formData.append("email", email)
    formData.append("profileInfoId", profileInfoId)

    const result = await resetPassword(formData)
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
        <p className="font-medium">Password successfully reset!</p>
        <p className="mt-2">
          Your password has been changed. You can now use your new password to
          log in.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form className="space-y-6" action={handleResetPassword}>
      <div>
        <Label htmlFor="password">New Password</Label>
        <div className="mt-2">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Password must be at least 8 characters long
        </div>
      </div>

      {error && (
        <div className="mt-2">
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}

      <div>
        <FormStatusButton isLoading={isLoading}>
          Reset Password
        </FormStatusButton>
      </div>
    </form>
  )
}
