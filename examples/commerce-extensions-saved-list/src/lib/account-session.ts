import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { createClient, getV2Accounts } from "@epcc-sdk/sdks-shopper"
import { ACCOUNT_TOKEN_COOKIE_KEY } from "../app/constants"
import { getImplicitAccessToken } from "./server-credentials"

export type AccountSession = {
  accountId: string
  accountName: string
}

export class IdentityUnavailableError extends Error {
  constructor() {
    super("Could not reach Elastic Path to identify the shopper")
    this.name = "IdentityUnavailableError"
  }
}

const identityClient = createClient({
  baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
})

export async function resolveAccount(
  token: string | undefined,
  deps: {
    implicitToken: () => Promise<string>
    listAccounts: typeof getV2Accounts
  },
): Promise<AccountSession | null> {
  if (!token) {
    return null
  }

  let response
  try {
    response = await deps.listAccounts({
      client: identityClient,
      headers: {
        Authorization: `Bearer ${await deps.implicitToken()}`,
        "EP-Account-Management-Authentication-Token": token,
      },
    })
  } catch {
    throw new IdentityUnavailableError()
  }

  if (response.error) {
    return null
  }

  const accounts = response.data?.data

  if (!accounts || accounts.length !== 1 || !accounts[0].id) {
    return null
  }

  return { accountId: accounts[0].id, accountName: accounts[0].name ?? "" }
}

export const getShopperSession = cache(
  async (): Promise<AccountSession | null> => {
    const cookieStore = await cookies()

    return resolveAccount(cookieStore.get(ACCOUNT_TOKEN_COOKIE_KEY)?.value, {
      implicitToken: getImplicitAccessToken,
      listAccounts: getV2Accounts,
    })
  },
)
