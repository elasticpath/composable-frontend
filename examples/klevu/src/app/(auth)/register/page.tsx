import { register } from "../actions";
import EpLogo from "../../../components/icons/ep-logo";
import { cookies } from "next/headers";
import { isAccountMemberAuthenticated } from "../../../lib/is-account-member-authenticated";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Label } from "../../../components/label/Label";
import { Input } from "../../../components/input/Input";
import { FormStatusButton } from "../../../components/button/FormStatusButton";

export default function Register() {
  const cookieStore = cookies();
  if (isAccountMemberAuthenticated(cookieStore)) {
    redirect("/account/summary");
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Link href="/">
            <EpLogo className="h-10 w-auto mx-auto" />
          </Link>
          <h2 className="mt-10 text-center text-2xl font-medium leading-9 tracking-tight text-gray-900">
            Register for an account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" action={register}>
            <div>
              <Label htmlFor="name">Name</Label>
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

            <div>
              <FormStatusButton className="w-full">Register</FormStatusButton>
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
