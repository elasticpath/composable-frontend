import "server-only"

import { createClient, getV2SettingsCart } from "@epcc-sdk/sdks-shopper"
import { getServerAccessToken } from "./server-credentials"

export const DOCUMENTED_DEFAULT_CART_EXPIRY_DAYS = 7

export type CartExpiry =
  | { status: "set"; days: number }
  | { status: "not-set" }
  | { status: "unreadable" }

export async function readCartExpiry({
  serverToken = getServerAccessToken,
  getSettings = getV2SettingsCart,
}: {
  serverToken?: () => Promise<string>
  getSettings?: typeof getV2SettingsCart
} = {}): Promise<CartExpiry> {
  let response
  try {
    response = await getSettings({
      client: createClient({
        baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
      }),
      headers: { Authorization: `Bearer ${await serverToken()}` },
    })
  } catch {
    return { status: "unreadable" }
  }

  if (response.error) {
    return { status: "unreadable" }
  }

  const days = response.data?.data?.cart_expiry_days

  return typeof days === "number" && Number.isInteger(days) && days > 0
    ? { status: "set", days }
    : { status: "not-set" }
}
