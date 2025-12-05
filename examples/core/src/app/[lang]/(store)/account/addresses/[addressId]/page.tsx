import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "src/lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "src/lib/cookie-constants";
import { Button } from "src/components/button/Button";
import { LocaleLink } from "src/components/LocaleLink";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Separator } from "src/components/separator/Separator";
import { UpdateForm } from "./UpdateForm";
import { createElasticPathClient } from "src/lib/create-elastic-path-client";
import { getV2AccountAddress } from "@epcc-sdk/sdks-shopper";

export const dynamic = "force-dynamic";

export default async function Address(props: {
  params: Promise<{ addressId: string, lang: string }>;
}) {
  const params = await props.params;
  const cookieStore = await cookies();
  const lang = params?.lang;

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    return redirect(lang ? `/${lang}/login` : "/login");
  }
  const { addressId } = params;

  const activeAccount = getSelectedAccount(accountMemberCookie);

  const client = await createElasticPathClient();

  const address = await getV2AccountAddress({
    client,
    path: {
      accountID: activeAccount.account_id,
      addressID: addressId,
    },
  });

  const addressData = address.data?.data;

  if (!addressData) {
    return notFound();
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
        <h2 className="text-2xl font-medium">Edit Address</h2>
        <UpdateForm addressId={addressId} addressData={addressData} />
      </div>
    </div>
  );
}
