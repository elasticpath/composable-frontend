import { client, type AccessTokenResponse } from "@epcc-sdk/sdks-shopper"
import { cookies } from "next/headers"
import { CREDENTIALS_COOKIE_KEY } from "../app/constants"

function parseCredentials(
  value: string | undefined,
): AccessTokenResponse | null {
  if (!value) return null
  try {
    return JSON.parse(value) as AccessTokenResponse
  } catch {
    return null
  }
}

let configured = false

export function configureClient() {
  if (configured) return client
  configured = true

  client.setConfig({
    baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL!,
  })

  client.interceptors.request.use(async (request) => {
    const cookieStore = await cookies()
    const credentialsCookie = cookieStore.get(CREDENTIALS_COOKIE_KEY)

    const credentials = parseCredentials(credentialsCookie?.value)

    if (credentials?.access_token) {
      request.headers.set("Authorization", `Bearer ${credentials.access_token}`)
    }

    return request
  })

  return client
}
