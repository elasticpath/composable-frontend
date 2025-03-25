import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "../../../lib/retrieve-account-member-credentials";
import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../lib/cookie-constants";
import {
  getV2AccountAddresses,
  getV2AccountMembersAccountMemberId,
  ResponseCurrency,
} from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "../../(store)/membership/create-elastic-path-client";
import { getCart } from "@epcc-sdk/sdks-shopper";
import { TAGS } from "../../../lib/constants";
import { AccountCheckoutForm } from "./AccoutCheckoutForm";

export async function AccountCheckout({
  cart,
  currencies,
}: {
  cart: NonNullable<Awaited<ReturnType<typeof getCart>>["data"]>;
  currencies: ResponseCurrency[];
}) {
  const client = createElasticPathClient();
  const accountMemberCookie = retrieveAccountMemberCredentials(
    await cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    throw new Error("Account member cookie not found");
  }

  const account = await getV2AccountMembersAccountMemberId({
    client,
    path: {
      accountMemberID: accountMemberCookie?.accountMemberId,
    },
    next: {
      tags: [TAGS.account],
    },
  });

  if (!account.data?.data) {
    throw new Error("Account not found");
  }

  const selectedAccount = getSelectedAccount(accountMemberCookie);

  const accountAddressesResponse = await getV2AccountAddresses({
    client,
    path: {
      accountID: selectedAccount.account_id,
    },
    next: {
      tags: [TAGS.accountAddresses],
    },
  });

  return (
    <AccountCheckoutForm
      cart={cart}
      account={account.data.data}
      addresses={accountAddressesResponse.data?.data ?? []}
      currencies={currencies}
    />
  );
}
