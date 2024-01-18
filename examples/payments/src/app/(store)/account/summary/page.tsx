import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../../lib/cookie-constants";
import { redirect } from "next/navigation";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "../../../../lib/retrieve-account-member-credentials";
import { Label } from "../../../../components/label/Label";
import { Input } from "../../../../components/input/Input";
import { FormStatusButton } from "../../../../components/button/FormStatusButton";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import { updateUserAuthenticationPasswordProfile } from "./actions";
import { YourInfoForm } from "./YourInfoForm";

export const dynamic = "force-dynamic";

export default async function AccountSummary() {
  const cookieStore = cookies();

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    return redirect("/login");
  }

  const client = getServerSideImplicitClient();

  const selectedAccount = getSelectedAccount(accountMemberCookie);

  const account: Awaited<ReturnType<typeof client.Accounts.Get>> =
    await client.request.send(
      `/accounts/${selectedAccount.account_id}`,
      "GET",
      null,
      undefined,
      client,
      undefined,
      "v2",
      {
        "EP-Account-Management-Authentication-Token": selectedAccount.token,
      },
    );

  const accountMember: Awaited<ReturnType<typeof client.AccountMembers.Get>> =
    await client.request.send(
      `/account-members/${accountMemberCookie.accountMemberId}`,
      "GET",
      null,
      undefined,
      client,
      undefined,
      "v2",
      {
        "EP-Account-Management-Authentication-Token": selectedAccount.token,
      },
    );

  return (
    <div className="flex flex-col gap-10 items-start w-full">
      <div className="flex flex-col gap-5 self-stretch">
        <h2 className="text-2xl">Your info</h2>
        <YourInfoForm
          defaultValues={{
            name: accountMember.data.name,
            email: accountMember.data.email,
          }}
          accountId={account.data.id}
        />
      </div>
      <div className="flex flex-col gap-5 self-stretch">
        <h2 className="text-2xl">Change Password</h2>
        <form
          className="flex flex-col self-stretch gap-5"
          action={updateUserAuthenticationPasswordProfile}
        >
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
            defaultValue={accountMember.data.email}
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
