"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME, CART_COOKIE_NAME, CREDENTIALS_COOKIE_NAME } from "src/lib/cookie-constants";
import { retrieveAccountMemberCredentials } from "src/lib/retrieve-account-member-credentials";
import { revalidatePath, revalidateTag } from "next/cache";
import { getErrorMessage } from "src/lib/get-error-message";
import { createElasticPathClient } from "src/lib/create-elastic-path-client";
import { postV2AccountMembersTokens } from "@epcc-sdk/sdks-shopper";
import { createCookieFromGenerateTokenResponse } from "src/lib/create-cookie-from-generate-token-response";

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

export async function login(props: FormData, lang: string) {
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

  redirect(returnUrl ?? (lang ? `/${lang}/` : "/"));
}

export async function logout(lang?: string, pathname?: string) {
  const cookieStore = await cookies();

  cookieStore.delete(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME);

  if (!pathname?.includes("account")) {
    redirect(pathname ? pathname : lang ? `/${lang}/` : "/");
  } else {
    redirect(lang ? `/${lang}/` : "/");
  }
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

  const lang = args?.get("lang")?.toString();
  if (!accountMemberCredentials) {
    redirect(lang ? `/${lang}/login` : "/login");
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

  const promises = [
    revalidatePath("/account"),
    revalidateTag("account"),
    revalidateTag("account-addresses"),
  ];

  await Promise.all(promises);
}

export async function register(data: FormData, lang: string) {
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

  redirect(lang ? `/${lang}/` : "/");
}

export async function getOidcProfile(
  realmId: string,
  profileId: string,
): Promise<any> {
  const cookieStore = await cookies();
  const credentialsCookie = cookieStore.get(CREDENTIALS_COOKIE_NAME);
  let accessToken: string | null = null;
  if (credentialsCookie?.value) {
    accessToken = JSON.parse(credentialsCookie.value).access_token;
  }
  const res = await fetch(
    `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}/v2/authentication-realms/${realmId}/oidc-profiles/${profileId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const data = await res.json();
  return data
}

export async function loadOidcProfiles(
  realmId: string,
): Promise<any> {
  const cookieStore = await cookies();
  const credentialsCookie = cookieStore.get(CREDENTIALS_COOKIE_NAME);
  let accessToken: string | null = null;
  if (credentialsCookie?.value) {
    accessToken = JSON.parse(credentialsCookie.value).access_token;
  }
  const res = await fetch(
    `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}/v2/authentication-realms/${realmId}/oidc-profiles`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const data = await res.json();
  return data;
}

export async function oidcLogin(
  code: string,
  redirectUri: string,
  codeVerifier: string,
  lang?: string,
  returnUrl?: string,
): Promise<any[]> {
  const cookieStore = await cookies();
  const credentialsCookie = cookieStore.get(CREDENTIALS_COOKIE_NAME);
  let accessToken: string | null = null;
  if (credentialsCookie?.value) {
    accessToken = JSON.parse(credentialsCookie.value).access_token;
  }
  const request: any = {
    type: "account_management_authentication_token",
    authentication_mechanism: "oidc",
    oauth_authorization_code: code,
    oauth_redirect_uri: redirectUri,
    oauth_code_verifier: codeVerifier,
  };

  const result: any = await fetch(
    `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}/v2/account-members/tokens`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: request }),
    },
  ).then(async (res) => {
    const data = await res.json();
    return data;
  })
  .catch((error) => {
    return {
      error: true,
      networkError: true,
      message: error?.message ?? String(error),
    };
  });
  
  await mergeCart(
    result?.data?.[0]?.token,
    result?.data?.[0]?.account_id,
    true,
    accessToken,
  );
  if (result?.data?.length > 0) {
    cookieStore.set(createCookieFromGenerateTokenResponse(result));
    redirect(returnUrl ?? (lang ? `/${lang}/` : "/"));
  }
  return result;
}

export async function mergeCart(
  token: string,
  accountId: string,
  isMergeEnabled: boolean,
  accessToken?: string | null,
) {
  const cookieStore = await cookies();
  const headers = {
    "EP-Account-Management-Authentication-Token": token,
  };
  if (!accessToken) {
    const cookieStore = await cookies();
    const credentialsCookie = cookieStore.get(CREDENTIALS_COOKIE_NAME);
    if (credentialsCookie?.value) {
      accessToken = JSON.parse(credentialsCookie.value).access_token;
    }
  }
  const accountCarts = await fetch(
    `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}/v2/carts`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...headers,
      },
    },
  ).then(async (res) => {
    const data = await res.json();
    return data;
  }).catch((err) => {
    console.error("Error while getting account carts", err);
  });

  const cartCookie = cookieStore.get(CART_COOKIE_NAME);
  const cartId = cartCookie?.value || "";
  let accountCartId = null;
  const validCarts = accountCarts?.data.filter((cart: any) => !cart.is_quote);
  if (validCarts.length > 0) {
    accountCartId = validCarts[0].id;
  } else {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}/v2/carts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ name: "Cart" }),
      },
    )
      .then(async (res) => {
        const data = await res.json()
        return data
      })
      .catch((err) => {
        console.error("Error while creating new cart for account", err)
      })

    accountCartId = response?.data?.id;
    await fetch(
      `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}/v2/carts/${accountCartId}/relationships/accounts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify([
          {
            type: "account",
            id: accountId,
          },
        ]),
      },
    ).catch((err) => {
      console.error("Error while associating cart with account", err)
    })
  }

  if (isMergeEnabled) {
    await fetch(
      `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}/v2/carts/${accountCartId}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          data: {
            type: "cart_items",
            cart_id: cartId,
          },
          options: {
            add_all_or_nothing: false,
          },
        }),
      },
    ).catch((err) => {
      console.error("Error while merge cart", err)
    })
  }
  cookieStore.set(CART_COOKIE_NAME, accountCartId);
}
