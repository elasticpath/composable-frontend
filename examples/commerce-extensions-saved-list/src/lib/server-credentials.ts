import "server-only"

import { createAnAccessToken } from "@epcc-sdk/sdks-shopper"

/**
 * The client_credentials token used for every saved list write.
 *
 * An implicit token is read-only, so nothing the browser holds can create or
 * delete a Custom API Entry. Writes therefore need a key with a secret, and a
 * key with a secret can only live on the server. That is the whole reason this
 * example has API routes instead of calling Elastic Path from the client.
 *
 * `server-only` makes importing this from a client component a build error
 * rather than a leaked secret.
 */

let cached: { token: string; expires: number } | undefined

function secondsFromNow(): number {
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

  // Refresh a minute early so a token does not expire mid-request.
  if (cached && cached.expires - 60 > secondsFromNow()) {
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
    expires: response.data?.expires ?? secondsFromNow() + 3600,
  }

  return cached.token
}
