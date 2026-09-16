import "server-only"

import { createAnAccessToken } from "@epcc-sdk/sdks-shopper"

let cached: { token: string; expires: number } | undefined

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

export async function getServerAccessToken(): Promise<string> {
  const clientId = process.env.EPCC_CLIENT_ID
  const clientSecret = process.env.EPCC_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error(
      "EPCC_CLIENT_ID and EPCC_CLIENT_SECRET must be set for saved list writes",
    )
  }

  if (cached && cached.expires - 60 > nowInSeconds()) {
    return cached.token
  }

  const response = await createAnAccessToken({
    baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
    body: {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    },
  })

  const accessToken = response.data?.access_token

  if (!accessToken) {
    throw new Error("Failed to get a client_credentials token")
  }

  cached = {
    token: accessToken,
    expires: response.data?.expires ?? nowInSeconds() + 3600,
  }

  return cached.token
}
