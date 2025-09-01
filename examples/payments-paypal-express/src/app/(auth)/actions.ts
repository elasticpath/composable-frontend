"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../lib/cookie-constants";
import { retrieveAccountMemberCredentials } from "../../lib/retrieve-account-member-credentials";
import { revalidatePath, revalidateTag } from "next/cache";
import { getErrorMessage } from "../../lib/get-error-message";
import { createElasticPathClient } from "../../lib/create-elastic-path-client";
import { postV2AccountMembersTokens } from "@epcc-sdk/sdks-shopper";
import { createCookieFromGenerateTokenResponse } from "../../lib/create-cookie-from-generate-token-response";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  returnUrl: z.string().optional(),
});

const selectedAccountSchema = z.object({
  accountId: z.string(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
});

const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID!;

const loginErrorMessage =
  "Failed to login, make sure your email and password are correct";

export async function login(props: FormData) {
  const client = createElasticPathClient();

  const rawEntries = Object.fromEntries(props.entries());

  const validatedProps = loginSchema.safeParse(rawEntries);

  if (!validatedProps.success) {
    return {
      error: loginErrorMessage,
    };
  }

  const { email, password, returnUrl } = validatedProps.data;

  try {
    const result = await postV2AccountMembersTokens({
      client,
      body: {
        data: {
          type: "account_management_authentication_token",
          authentication_mechanism: "password",
          password_profile_id: PASSWORD_PROFILE_ID,
          username: email.toLowerCase(), // Known bug for uppercase usernames so we force lowercase.
          password,
        },
      },
    });

    const cookieStore = await cookies();

    if (!result.data) {
      return {
        error: loginErrorMessage,
      };
    }

    cookieStore.set(createCookieFromGenerateTokenResponse(result.data));
  } catch (error) {
    console.error(getErrorMessage(error));
    return {
      error: loginErrorMessage,
    };
  }

  redirect(returnUrl ?? "/");
}

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME);

  redirect("/");
}

export async function selectedAccount(args: FormData) {
  const rawEntries = Object.fromEntries(args.entries());

  const validatedProps = selectedAccountSchema.safeParse(rawEntries);

  if (!validatedProps.success) {
    throw new Error("Invalid account id");
  }

  const { accountId } = validatedProps.data;

  const cookieStore = await cookies();

  const accountMemberCredentials = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCredentials) {
    redirect("/login");
    return;
  }

  const selectedAccount = accountMemberCredentials?.accounts[accountId];

  if (!selectedAccount) {
    throw new Error("Invalid account id");
  }

  cookieStore.set({
    name: ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
    value: JSON.stringify({
      ...accountMemberCredentials,
      selected: selectedAccount.account_id,
    }),
    path: "/",
    sameSite: "strict",
    expires: new Date(
      accountMemberCredentials.accounts[
        Object.keys(accountMemberCredentials.accounts)[0]!
      ]!.expires,
    ),
  });
  revalidatePath("/account");
  revalidateTag("account");
  revalidateTag("account-addresses");
}

export async function register(data: FormData) {
  const client = await createElasticPathClient();

  const validatedProps = registerSchema.safeParse(
    Object.fromEntries(data.entries()),
  );

  if (!validatedProps.success) {
    throw new Error("Invalid email or password or name");
  }

  const { email, password, name } = validatedProps.data;

  const result = await postV2AccountMembersTokens({
    client,
    body: {
      data: {
        type: "account_management_authentication_token",
        authentication_mechanism: "self_signup",
        password_profile_id: PASSWORD_PROFILE_ID,
        username: email.toLowerCase(), // Known bug for uppercase usernames so we force lowercase.
        password,
        name,
        email,
      },
    },
  });

  const cookieStore = await cookies();

  if (!result.data) {
    console.error(JSON.stringify(result.error));
    throw new Error("Failed to register");
  }

  cookieStore.set(createCookieFromGenerateTokenResponse(result.data));

  redirect("/");
}
