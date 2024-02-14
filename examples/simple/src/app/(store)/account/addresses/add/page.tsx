import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { retrieveAccountMemberCredentials } from "../../../../../lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../../../lib/cookie-constants";
import { Button } from "../../../../../components/button/Button";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Separator } from "../../../../../components/separator/Separator";
import { AddForm } from "./AddForm";

export const dynamic = "force-dynamic";

export default async function AddAddress() {
  const cookieStore = cookies();

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    return redirect("/login");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex self-stretch">
        <Button variant="secondary" size="medium" asChild>
          <Link href="/account/addresses">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to addresses
          </Link>
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl font-medium">Add Address</h2>
        <AddForm />
      </div>
    </div>
  );
}
