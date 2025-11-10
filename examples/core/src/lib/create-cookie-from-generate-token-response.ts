import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "./cookie-constants";
import {
  AccountManagementAuthenticationTokenResponse,
  postV2AccountMembersTokens,
} from "@epcc-sdk/sdks-shopper";
import {
  AccountMemberCredential,
  AccountMemberCredentials,
} from "../app/(auth)/account-member-credentials-schema";

export type AccountMemberAuthResponse = NonNullable<
  Awaited<ReturnType<typeof postV2AccountMembersTokens>>["data"]
>;

export function createCookieFromGenerateTokenResponse(
  response: AccountMemberAuthResponse,
): ResponseCookie {
  const { expires } = response.data?.[0] ?? {}; // assuming all tokens have shared expiration date/time

  const cookieValue = createAccountMemberCredentialsCookieValue(
    response.data!,
    (response.meta as unknown as { account_member_id: string })
      .account_member_id, // TODO update sdk types
  );

  return {
    name: ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
    value: JSON.stringify(cookieValue),
    path: "/",
    sameSite: "strict",
    expires: new Date(expires as unknown as string),
  };
}

function createAccountMemberCredentialsCookieValue(
  responseTokens: AccountManagementAuthenticationTokenResponse[],
  accountMemberId: string,
): AccountMemberCredentials {
  return {
    accounts: responseTokens.reduce(
      (acc, responseToken) => ({
        ...acc,
        [responseToken.account_id!]: {
          account_id: responseToken.account_id!,
          account_name: responseToken.account_name!,
          expires: responseToken.expires! as unknown as string,
          token: responseToken.token!,
          type: "account_management_authentication_token" as const,
        },
      }),
      {} as Record<string, AccountMemberCredential>,
    ),
    selected: responseTokens[0]!.account_id!,
    accountMemberId,
  };
}
