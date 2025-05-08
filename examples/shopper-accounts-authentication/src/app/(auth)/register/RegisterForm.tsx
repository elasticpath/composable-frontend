"use client"

import { register } from "../../actions"
import { FormStatusButton, Input, Label } from "../../../components/ui"
import { useState } from "react"

export function RegisterForm() {
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  async function registerAction(formData: FormData) {
    setIsLoading(true)
    const result = await register(formData)
    setIsLoading(false)

    if (result && "error" in result) {
      setError(result.error)
    }
  }

  return (
    <form className="space-y-6" action={registerAction}>
      <div>
        <Label htmlFor="name">Full name</Label>
        <div className="mt-2">
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
          />
        </div>
      </div>

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
        <Label htmlFor="password">Password</Label>
        <div className="mt-2">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
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
        <FormStatusButton isLoading={isLoading}>Register</FormStatusButton>
      </div>
    </form>
  )
}
