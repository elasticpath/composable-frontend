import "server-only"

import { createAnAccessToken } from "@epcc-sdk/sdks-shopper"

const EXPIRY_MARGIN_SECONDS = 60

let cachedImplicit: { token: string; expires: number } | undefined

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

export async function getImplicitAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID

  if (!clientId) {
    throw new Error("NEXT_PUBLIC_EPCC_CLIENT_ID must be set")
  }

  if (
    cachedImplicit &&
    cachedImplicit.expires - EXPIRY_MARGIN_SECONDS > nowInSeconds()
  ) {
    return cachedImplicit.token
  }

  const response = await createAnAccessToken({
    baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
    body: { grant_type: "implicit", client_id: clientId },
  })

  if (response.error) {
    throw new Error("Failed to get an implicit token")
  }

  const accessToken = response.data?.access_token

  if (!accessToken) {
    throw new Error("Failed to get an implicit token")
  }

  cachedImplicit = {
    token: accessToken,
    expires: response.data?.expires ?? nowInSeconds() + 3600,
  }

  return cachedImplicit.token
}
