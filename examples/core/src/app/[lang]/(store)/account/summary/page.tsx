import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "src/lib/cookie-constants";
import { redirect } from "next/navigation";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "src/lib/retrieve-account-member-credentials";
import { Label } from "src/components/label/Label";
import { Input } from "src/components/input/Input";
import { FormStatusButton } from "src/components/button/FormStatusButton";
import { YourInfoForm } from "./YourInfoForm";
import { createElasticPathClient } from "src/lib/create-elastic-path-client";
import {
  getV2AccountsAccountId,
  getV2AccountMembersAccountMemberId,
} from "@epcc-sdk/sdks-shopper";
import { TAGS } from "src/lib/constants";

export const dynamic = "force-dynamic";

export default async function AccountSummary() {
  const cookieStore = await cookies();

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    return redirect("/login");
  }

  const client = createElasticPathClient();

  const selectedAccount = getSelectedAccount(accountMemberCookie);

  const account = await getV2AccountsAccountId({
    client,
    path: {
      accountID: selectedAccount.account_id,
    },
    next: {
      tags: [TAGS.account],
    },
  });

  const accountMember = await getV2AccountMembersAccountMemberId({
    client,
    path: {
      accountMemberID: accountMemberCookie.accountMemberId,
    },
    next: {
      tags: [TAGS.account],
    },
  });

  return (
    <div className="flex flex-col gap-10 items-start w-full">
      <div className="flex flex-col gap-5 self-stretch">
        <h2 className="text-2xl">Your info</h2>
        <YourInfoForm
          defaultValues={{
            name: accountMember.data?.data?.name,
            email: accountMember.data?.data?.email,
          }}
          accountId={account.data?.data?.id!}
        />
      </div>
      <div className="flex flex-col gap-5 self-stretch">
        <h2 className="text-2xl">Change Password</h2>
        <form className="flex flex-col self-stretch gap-5">
          <fieldset className="flex flex-col self-stretch gap-5">
            <legend className="sr-only">Password information</legend>
            <p>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                type="password"
                id="currentPassword"
                name="currentPassword"
              />
            </p>
            <p>
              <Label htmlFor="currentPassword">New password</Label>
              <Input type="password" id="newPassword" name="newPassword" />
            </p>
            <p>
              <Label htmlFor="currentPassword">Confirm new password</Label>
              <Input type="password" id="newPassword" name="newPassword" />
            </p>
          </fieldset>
          <input
            name="username"
            readOnly
            type="hidden"
            defaultValue={accountMember.data?.data?.email}
          />
          <section>
            <FormStatusButton variant="secondary">
              Save changes
            </FormStatusButton>
          </section>
        </form>
      </div>
    </div>
  );
}
