import "server-only"

import { createAnAccessToken } from "@epcc-sdk/sdks-shopper"

const EXPIRY_MARGIN_SECONDS = 60

type CachedToken = { token: string; expires: number }

let cachedImplicit: CachedToken | undefined
let cachedServer: CachedToken | undefined

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

function stillFresh(cached: CachedToken | undefined): cached is CachedToken {
  return (
    cached !== undefined &&
    cached.expires - EXPIRY_MARGIN_SECONDS > nowInSeconds()
  )
}

async function mintToken(
  kind: string,
  body: NonNullable<Parameters<typeof createAnAccessToken>[0]>["body"],
): Promise<CachedToken> {
  const response = await createAnAccessToken({
    baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
    body,
  })

  if (response.error) {
    throw new Error(`Failed to get ${kind}`)
  }

  const accessToken = response.data?.access_token

  if (!accessToken) {
    throw new Error(`Failed to get ${kind}`)
  }

  return {
    token: accessToken,
    expires: response.data?.expires ?? nowInSeconds() + 3600,
  }
}

export async function getImplicitAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID

  if (!clientId) {
    throw new Error("NEXT_PUBLIC_EPCC_CLIENT_ID must be set")
  }

  if (stillFresh(cachedImplicit)) {
    return cachedImplicit.token
  }

  cachedImplicit = await mintToken("an implicit token", {
    grant_type: "implicit",
    client_id: clientId,
  })

  return cachedImplicit.token
}

export async function getServerAccessToken(): Promise<string> {
  const clientId = process.env.EPCC_CLIENT_ID
  const clientSecret = process.env.EPCC_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("EPCC_CLIENT_ID and EPCC_CLIENT_SECRET must be set")
  }

  if (stillFresh(cachedServer)) {
    return cachedServer.token
  }

  cachedServer = await mintToken("a server token", {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  })

  return cachedServer.token
}
