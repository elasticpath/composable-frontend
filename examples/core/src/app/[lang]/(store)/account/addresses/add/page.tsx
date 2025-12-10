import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { retrieveAccountMemberCredentials } from "src/lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "src/lib/cookie-constants";
import { Button } from "src/components/button/Button";
import { LocaleLink } from "src/components/LocaleLink";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Separator } from "src/components/separator/Separator";
import { AddForm } from "./AddForm";

export const dynamic = "force-dynamic";

export default async function AddAddress({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  const cookieStore = await cookies();

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    return redirect(lang ? `/${lang}/login` : "/login");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex self-stretch">
        <Button variant="secondary" size="medium" asChild>
          <LocaleLink href="/account/addresses">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to addresses
          </LocaleLink>
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl font-medium">Add Address</h2>
        <AddForm lang={lang as string} />
      </div>
    </div>
  );
}
