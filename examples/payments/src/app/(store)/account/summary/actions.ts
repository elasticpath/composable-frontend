"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "../../../../lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../../lib/cookie-constants";
import { revalidatePath } from "next/cache";
import { getServerSideCredentialsClient } from "../../../../lib/epcc-server-side-credentials-client";
import { getErrorMessage } from "../../../../lib/get-error-message";

const updateAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * TODO request not working for implicit token + EP account management token
 * @param formData
 */
export async function updateAccount(formData: FormData) {
  const client = getServerSideImplicitClient();

  const rawEntries = Object.fromEntries(formData.entries());

  const validatedFormData = updateAccountSchema.safeParse(rawEntries);

  if (!validatedFormData.success) {
    console.error(JSON.stringify(validatedFormData.error));
    throw new Error("Invalid account submission");
  }

  const accountMemberCreds = retrieveAccountMemberCredentials(
    cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCreds) {
    throw new Error("Account member credentials not found");
  }

  const selectedAccount = getSelectedAccount(accountMemberCreds);

  const { name, id } = validatedFormData.data;

  const body = {
    data: {
      type: "account",
      name,
      legal_name: name,
    },
  };

  try {
    // TODO fix the sdk typing for this endpoint
    //    should be able to include the token in the request
    await client.request.send(
      `/accounts/${id}`,
      "PUT",
      body,
      undefined,
      client,
      false,
      "v2",
      {
        "EP-Account-Management-Authentication-Token": selectedAccount.token,
      },
    );

    revalidatePath("/accounts/summary");
  } catch (error) {
    console.error(getErrorMessage(error));
    return {
      error: getErrorMessage(error),
    };
  }

  return;
}

const updateUserAuthenticationPasswordProfileSchema = z.object({
  username: z.string(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID!;
const AUTHENTICATION_REALM_ID =
  process.env.NEXT_PUBLIC_AUTHENTICATION_REALM_ID!;

export async function updateUserAuthenticationPasswordProfile(
  formData: FormData,
) {
  const client = getServerSideImplicitClient();

  const rawEntries = Object.fromEntries(formData.entries());

  const validatedFormData =
    updateUserAuthenticationPasswordProfileSchema.safeParse(rawEntries);

  if (!validatedFormData.success) {
    console.error(JSON.stringify(validatedFormData.error));
    throw new Error("Invalid submission");
  }

  const accountMemberCreds = retrieveAccountMemberCredentials(
    cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCreds) {
    throw new Error("Account member credentials not found");
  }

  const { username, newPassword, currentPassword } = validatedFormData.data;

  // Re auth the user to check the current password is correct
  const reAuthResult = await client.AccountMembers.GenerateAccountToken({
    type: "account_management_authentication_token",
    authentication_mechanism: "password",
    password_profile_id: PASSWORD_PROFILE_ID,
    username,
    password: currentPassword,
  });

  const reAuthedSelectedAccount = reAuthResult.data.find(
    (entry) => entry.account_id === accountMemberCreds.selected,
  );

  if (!reAuthedSelectedAccount) {
    throw new Error("Error re-authenticating user");
  }

  const credsClient = getServerSideCredentialsClient();
  const userAuthenticationPasswordProfileInfoResult =
    await credsClient.UserAuthenticationPasswordProfile.All(
      AUTHENTICATION_REALM_ID,
      accountMemberCreds.accountMemberId,
    );

  const userAuthenticationPasswordProfileInfo =
    userAuthenticationPasswordProfileInfoResult.data.find(
      (entry) => entry.password_profile_id === PASSWORD_PROFILE_ID,
    );

  if (!userAuthenticationPasswordProfileInfo) {
    throw new Error(
      "User authentication password profile info not found for password profile",
    );
  }

  const body = {
    data: {
      type: "user_authentication_password_profile_info",
      id: userAuthenticationPasswordProfileInfo.id,
      password_profile_id: PASSWORD_PROFILE_ID,
      ...(username && { username }),
      ...(newPassword && { password: newPassword }),
    },
  };

  try {
    // TODO fix the sdk typing for this endpoint
    //    should be able to include the token in the request
    await client.request.send(
      `/authentication-realms/${AUTHENTICATION_REALM_ID}/user-authentication-info/${accountMemberCreds.accountMemberId}/user-authentication-password-profile-info/${userAuthenticationPasswordProfileInfo.id}`,
      "PUT",
      body,
      undefined,
      client,
      false,
      "v2",
      {
        "EP-Account-Management-Authentication-Token":
          reAuthedSelectedAccount.token,
      },
    );

    revalidatePath("/accounts");
  } catch (error) {
    console.error(error);
    throw new Error("Error updating account");
  }
}

// async function getOneTimePasswordToken(
//   client: ElasticPath,
//   username: string,
// ): Promise<string> {
//   const response = await client.OneTimePasswordTokenRequest.Create(
//     AUTHENTICATION_REALM_ID,
//     PASSWORD_PROFILE_ID,
//     {
//       type: "one_time_password_token_request",
//       username,
//       purpose: "reset_password",
//     },
//   );
//
//   const result2 = await client.request.send(
//     `/authentication-realms/${AUTHENTICATION_REALM_ID}/password-profiles/${PASSWORD_PROFILE_ID}/one-time-password-token-request`,
//     "POST",
//     {
//       data: {
//         type: "one_time_password_token_request",
//         username,
//         purpose: "reset_password",
//       },
//     },
//     undefined,
//     client,
//     false,
//     "v2",
//   );
//
//   return response;
// }
