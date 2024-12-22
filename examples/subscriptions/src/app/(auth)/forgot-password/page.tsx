import EpLogo from "../../../components/icons/ep-logo";
import Link from "next/link";
import { Label } from "../../../components/label/Label";
import { Input } from "../../../components/input/Input";
import { FormStatusButton } from "../../../components/button/FormStatusButton";
import { requestPasswordReset } from "./actions";

export default function ForgotPassword() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Link href="/">
          <EpLogo className="h-10 w-auto mx-auto" />
        </Link>
        <h2 className="mt-10 text-center text-2xl font-medium leading-9 tracking-tight text-gray-900">
          Reset your password
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" action={requestPasswordReset}>
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
            <FormStatusButton className="w-full">
              Send reset instructions
            </FormStatusButton>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link
            href="/login"
            className="leading-6 text-brand-primary hover:text-brand-highlight"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 