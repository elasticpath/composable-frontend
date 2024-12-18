'use client'
import { requestPasswordReset } from "../actions";
import { useFormState } from "react-dom";
import EpLogo from "../../../components/icons/ep-logo";
import Link from "next/link";
import { Label } from "../../../components/label/Label";
import { Input } from "../../../components/input/Input";
import { FormStatusButton } from "../../../components/button/FormStatusButton";

export default function ForgotPassword() {
  const initialState = {
    message: '',
  }

  const [state, formAction] = useFormState(requestPasswordReset, initialState)
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Link href="/">
            <EpLogo className="h-10 w-auto mx-auto" />
          </Link>
          <h2 className="mt-10 text-center text-2xl font-medium leading-9 tracking-tight text-gray-900">
            Request a password reset
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" action={formAction}>
            <div>
              <Label htmlFor="username">Email Address</Label>
              <div className="mt-2">
                <Input id="username" name="username" type="email" autoComplete="email" required />
              </div>
            </div>
            <div>
              <FormStatusButton className="w-full">Reset Password</FormStatusButton>
              <p aria-live="polite">{state?.message}</p>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Already a member?{" "}
            <a
              href="/login"
              className="leading-6 text-brand-primary hover:text-brand-highlight"
            >
              Login now!
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
