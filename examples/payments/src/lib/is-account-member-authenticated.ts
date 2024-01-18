import type { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "./cookie-constants";
import { parseAccountMemberCredentialsCookieStr } from "./retrieve-account-member-credentials";

export function isAccountMemberAuthenticated(
  cookieStore: ReturnType<typeof cookies>,
): boolean {
  const cookie = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME);
  const parsedCredentials =
    cookie && parseAccountMemberCredentialsCookieStr(cookie.value);

  return !!parsedCredentials;
}
