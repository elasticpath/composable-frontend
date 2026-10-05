import { postV2AccountMembersTokens } from "@epcc-sdk/sdks-shopper"
import { createStoreClient } from "./store-client"

export type SignInResult =
  | { ok: true; token: string; expires: Date }
  | { ok: false; reason: "rejected" | "unavailable" }

type SignInDeps = {
  implicitToken: () => Promise<string>
  requestToken: typeof postV2AccountMembersTokens
}

const signInClient = createStoreClient()

function isServerFailure(status: number | undefined): boolean {
  return status === undefined || status >= 500
}

export async function signInWithPassword(
  {
    email,
    password,
    passwordProfileId,
  }: { email: string; password: string; passwordProfileId: string },
  deps: SignInDeps,
): Promise<SignInResult> {
  let response
  try {
    response = await deps.requestToken({
      client: signInClient,
      headers: { Authorization: `Bearer ${await deps.implicitToken()}` },
      body: {
        data: {
          type: "account_management_authentication_token",
          authentication_mechanism: "password",
          password_profile_id: passwordProfileId,
          username: email.toLowerCase(),
          password,
        },
      },
    })
  } catch {
    return { ok: false, reason: "unavailable" }
  }

  if (response.error) {
    return {
      ok: false,
      reason: isServerFailure(response.response?.status)
        ? "unavailable"
        : "rejected",
    }
  }

  const member = response.data?.data?.[0]

  if (!member?.token || !member.expires) {
    return { ok: false, reason: "rejected" }
  }

  return { ok: true, token: member.token, expires: new Date(member.expires) }
}
