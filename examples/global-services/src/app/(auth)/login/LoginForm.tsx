"use client";

import { login } from "../actions";
import { Label } from "../../../components/label/Label";
import { Input } from "../../../components/input/Input";
import { FormStatusButton } from "../../../components/button/FormStatusButton";
import { useState } from "react";

export function LoginForm({ returnUrl }: { returnUrl?: string }) {
  const [error, setError] = useState<string | undefined>(undefined);

  async function loginAction(formData: FormData) {
    const result = await login(formData);

    if ("error" in result) {
      setError(result.error);
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
            <a
              href="#"
              className="font-light text-brand-primary hover:text-brand-highlight"
            >
              Forgot password?
            </a>
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
        <FormStatusButton className="w-full">Login</FormStatusButton>
      </div>
    </form>
  );
}
