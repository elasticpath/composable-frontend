import {
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../../lib/cookie-constants";
import { redirect } from "next/navigation";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "../../../../lib/retrieve-account-member-credentials";
import Link from "next/link";
import { Button } from "../../../../components/button/Button";
import { Separator } from "../../../../components/separator/Separator";
import React from "react";
import { DeleteAddressBtn } from "./DeleteAddressBtn";

export const dynamic = "force-dynamic";

export default async function Addresses() {
  const cookieStore = cookies();

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    return redirect("/login");
  }

  const selectedAccount = getSelectedAccount(accountMemberCookie);

  const client = getServerSideImplicitClient();

  const addresses = await client.AccountAddresses.All({
    account: selectedAccount.account_id,
    token: selectedAccount.token,
  });

  return (
    <div className="flex flex-col gap-5 items-start w-full">
      <div className="flex flex-col gap-5 self-stretch">
        <h2 className="text-2xl">Your info</h2>
        <ul role="list">
          {addresses.data.map((address) => (
            <li
              key={address.id}
              className="flex items-center justify-between gap-x-6 py-5 shadow-[0_-1px_0_0_rgba(0,0,0,0.10)]"
            >
              <div className="min-w-0">
                <div className="flex items-start gap-x-3">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    {address.name}
                  </p>
                </div>
                <div className="mt-1 flex flex-col gap-x-2 text-xs leading-5 text-gray-500">
                  <p className="whitespace-nowrap">
                    {address.first_name} {address.last_name}
                  </p>
                  <p className="whitespace-nowrap">{address.line_1}</p>
                  <p className="whitespace-nowrap">{address.postcode}</p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-x-4">
                <Button asChild variant="secondary" size="small">
                  <Link href={`/account/addresses/${address.id}`}>
                    <PencilSquareIcon className="mr-2 h-3.5 w-3.5" />
                    Edit<span className="sr-only">, {address.name}</span>
                  </Link>
                </Button>
                <DeleteAddressBtn addressId={address.id} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Separator />
      <div className="flex self-stretch">
        <Button variant="link" size="medium" className="px-0" asChild>
          <Link href="/account/addresses/add">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Address
          </Link>
        </Button>
      </div>
    </div>
  );
}
