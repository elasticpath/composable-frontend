import { cookies } from "next/headers";
import {
  AccountMemberCredential,
  AccountMemberCredentials,
  accountMemberCredentialsSchema,
} from "../app/(auth)/account-member-credentials-schema";

export function getSelectedAccount(
  memberCredentials: AccountMemberCredentials,
): AccountMemberCredential {
  const selectedAccount =
    memberCredentials.accounts[memberCredentials.selected];
  if (!selectedAccount) {
    throw new Error("No selected account");
  }
  return selectedAccount;
}

export function retrieveAccountMemberCredentials(
  cookieStore: ReturnType<typeof cookies>,
  name: string,
) {
  const accountMemberCookie = cookieStore.get(name);

  // Next.js cookieStore.delete replaces a cookie with an empty string so we need to check for that here.
  if (!accountMemberCookie || !accountMemberCookie.value) {
    return undefined;
  }

  return parseAccountMemberCredentialsCookieStr(accountMemberCookie?.value);
}

export function parseAccountMemberCredentialsCookieStr(
  str: string,
): AccountMemberCredentials | undefined {
  const parsedCookie = accountMemberCredentialsSchema.safeParse(
    JSON.parse(str),
  );

  if (!parsedCookie.success) {
    console.error(
      "Failed to parse account member cookie: ",
      parsedCookie.error,
    );
    return undefined;
  }

  return parsedCookie.data;
}
