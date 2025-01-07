import EpLogo from "../../../components/icons/ep-logo";
import { cookies } from "next/headers";
import { isAccountMemberAuthenticated } from "../../../lib/is-account-member-authenticated";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function Login({
  searchParams,
}: {
  searchParams: { returnUrl?: string };
}) {
  const { returnUrl } = searchParams;

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
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <LoginForm returnUrl={returnUrl} />

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{" "}
            <a
              href="/register"
              className="leading-6 text-brand-primary hover:text-brand-highlight"
            >
              Register now!
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
