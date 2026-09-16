import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { getV2Accounts } from "@epcc-sdk/sdks-shopper"
import { ACCOUNT_TOKEN_COOKIE_KEY } from "../app/constants"
import { getImplicitAccessToken } from "./server-credentials"

export type AccountSession = {
  accountId: string
  accountName: string
}

export const getShopperSession = cache(
  async (): Promise<AccountSession | null> => {
    const cookieStore = await cookies()
    const token = cookieStore.get(ACCOUNT_TOKEN_COOKIE_KEY)?.value

    if (!token) {
      return null
    }

    const response = await getV2Accounts({
      baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
      headers: {
        Authorization: `Bearer ${await getImplicitAccessToken()}`,
        "EP-Account-Management-Authentication-Token": token,
      },
    })

    const accounts = response.data?.data

    if (!accounts || accounts.length !== 1 || !accounts[0].id) {
      return null
    }

    return { accountId: accounts[0].id, accountName: accounts[0].name ?? "" }
  },
)
