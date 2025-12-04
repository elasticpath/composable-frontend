import EpLogo from "src/components/icons/ep-logo";
import { cookies } from "next/headers";
import { isAccountMemberAuthenticated } from "src/lib/is-account-member-authenticated";
import { redirect } from "next/navigation";
import { LocaleLink } from "src/components/LocaleLink";
import { LoginForm } from "./LoginForm";

export default async function Login(
  props: {
    searchParams: Promise<{ returnUrl?: string }>;
    params: Promise<{ lang?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const { returnUrl } = searchParams;

  const params = await props.params;
  const { lang } = params;

  const cookieStore = await cookies();

  if (isAccountMemberAuthenticated(cookieStore)) {
    redirect(lang ? `/${lang}/account/summary` : "/account/summary");
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <LocaleLink href="/">
            <EpLogo className="h-10 w-auto mx-auto" />
          </LocaleLink>
          <h2 className="mt-10 text-center text-2xl font-medium leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <LoginForm returnUrl={returnUrl} />

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{" "}
            <LocaleLink
              href="/register"
              className="leading-6 text-brand-primary hover:text-brand-highlight"
            >
              Register now!
            </LocaleLink>
          </p>
        </div>
      </div>
    </>
  );
}
