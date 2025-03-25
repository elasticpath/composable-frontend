import { AccountSwitcher } from "./AccountSwitcher";
import { AccountPopover } from "./AccountPopover";
import { getV2AccountMembersAccountMemberId } from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "../../../app/(store)/membership/create-elastic-path-client";
import { retrieveAccountMemberCredentials } from "../../../lib/retrieve-account-member-credentials";
import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../lib/cookie-constants";

export async function AccountMenu() {
  const client = createElasticPathClient();

  const accountMemberCookie = retrieveAccountMemberCredentials(
    await cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  const accountMember = accountMemberCookie?.accountMemberId
    ? await getV2AccountMembersAccountMemberId({
        client,
        path: {
          accountMemberID: accountMemberCookie.accountMemberId,
        },
      })
    : undefined;

  return (
    <AccountPopover
      account={accountMember?.data?.data}
      accountMemberTokens={accountMemberCookie}
      accountSwitcher={<AccountSwitcher />}
    />
  );
}
