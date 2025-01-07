
import EpLogo from "../../../components/icons/ep-logo";
import Link from "next/link";
import { getServerSideImplicitClient } from "../../../lib/epcc-server-side-implicit-client";
import ResetPasswordForm from "./reset-password-form";

type EPCCError = {
  detail: string
  status: string
  title: string
}
type EPCCErrors = {
  errors: [EPCCError];
};

async function getAccountTokens(username: string, otp: string) {
  const client = getServerSideImplicitClient();
  const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID!;
  return client.AccountMembers.GenerateAccountToken({
    type: "account_management_authentication_token",
    authentication_mechanism: "passwordless",
    password_profile_id: PASSWORD_PROFILE_ID,
    username: username.toLowerCase(),
    one_time_password_token: otp
  });
}

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const userAuthInfoId = searchParams["userAuthenticationInfoId"];
  const otp = searchParams["otp"];
  const username = searchParams["username"];
  const authenticationRealmId = searchParams["authenticationRealmId"];
  const userAuthenticationPasswordProfileInfoId = searchParams["userAuthenticationPasswordProfileInfoId"];
  const passwordProfileId = searchParams["passwordProfileId"];

  try {
    const accountTokens = await getAccountTokens(username!, otp!);

    return (
      <>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Link href="/">
              <EpLogo className="h-10 w-auto mx-auto" />
            </Link>
            <h2 className="mt-10 text-center text-2xl font-medium leading-9 tracking-tight text-gray-900">
              Reset your password
            </h2>
          </div>
          <ResetPasswordForm accountTokens={accountTokens} 
          userAuthInfoId={userAuthInfoId} 
          authenticationRealmId={authenticationRealmId} 
          userAuthenticationPasswordProfileInfoId={userAuthenticationPasswordProfileInfoId}
          passwordProfileId={passwordProfileId} />
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          </div>
        </div>
      </>
    );
  } catch (errors) {
    const authRealmErrors = (errors as EPCCErrors).errors.filter(
      error => {
        return error.detail === "the authorization realm for the token could not be found"
      });

    if (authRealmErrors.length > 0) {
      return (
        <>
          <div className="flex h-[36rem] flex-col items-center justify-center gap-4 p-8">
            <span className="text-center text-xl md:text-3xl">The password reset link has expired</span>
            <Link href="/forgot-password" className="font-md md:font-lg text-brand-primary">
              Retry
            </Link>
            <Link href="/" className="font-md md:font-lg text-brand-primary">
              Back to home
            </Link>
          </div>
        </>
      );
    } else {
      console.error("Unexpected Error while obtaining account token", errors);
      throw new Error("Unexpected Error while obtaining account token");
    }
  }

}
