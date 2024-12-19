import EpLogo from "../../../components/icons/ep-logo";
import Link from "next/link";
import { Label } from "../../../components/label/Label";
import { Input } from "../../../components/input/Input";
import { FormStatusButton } from "../../../components/button/FormStatusButton";
import { resetPassword } from "./actions";

export default function ResetPassword({
  searchParams,
}: {
  searchParams: { 
    token?: string;
    email?: string;
    password_profile_id?: string;
    user_authentication_info_id?: string;
    user_authentication_password_profile_info_id?: string;
  };
}) {
  const { token, email, password_profile_id, user_authentication_info_id, user_authentication_password_profile_info_id } = searchParams;

  if (!token || !email || !password_profile_id) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <p className="text-center text-red-600">Missing required parameters</p>
          <p className="mt-10 text-center text-sm text-gray-500">
            <Link
              href="/forgot-password"
              className="leading-6 text-brand-primary hover:text-brand-highlight"
            >
              Request a new password reset
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Link href="/">
          <EpLogo className="h-10 w-auto mx-auto" />
        </Link>
        <h2 className="mt-10 text-center text-2xl font-medium leading-9 tracking-tight text-gray-900">
          Set new password
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" action={resetPassword}>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="password_profile_id" value={password_profile_id} />
          <input type="hidden" name="user_authentication_info_id" value={user_authentication_info_id} />
          <input type="hidden" name="user_authentication_password_profile_info_id" value={user_authentication_password_profile_info_id} />
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <div className="mt-2">
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <div className="mt-2">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
          </div>

          <div>
            <FormStatusButton className="w-full">
              Reset password
            </FormStatusButton>
          </div>
        </form>
      </div>
    </div>
  );
} 