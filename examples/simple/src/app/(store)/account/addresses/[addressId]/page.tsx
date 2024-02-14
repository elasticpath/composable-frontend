import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "../../../../../lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../../../lib/cookie-constants";
import { getServerSideImplicitClient } from "../../../../../lib/epcc-server-side-implicit-client";
import { Button } from "../../../../../components/button/Button";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Separator } from "../../../../../components/separator/Separator";
import { UpdateForm } from "./UpdateForm";

export const dynamic = "force-dynamic";

export default async function Address({
  params,
}: {
  params: { addressId: string };
}) {
  const cookieStore = cookies();

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    return redirect("/login");
  }
  const { addressId } = params;

  const activeAccount = getSelectedAccount(accountMemberCookie);

  const client = getServerSideImplicitClient();

  const address = await client.AccountAddresses.Get({
    account: activeAccount.account_id,
    address: addressId,
    token: activeAccount.token,
  });

  const addressData = address.data;

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
        <h2 className="text-2xl font-medium">Edit Address</h2>
        <UpdateForm addressId={addressId} addressData={addressData} />
      </div>
    </div>
  );
}
