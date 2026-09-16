import { client, type AccessTokenResponse } from "@epcc-sdk/sdks-shopper"
import { cookies } from "next/headers"
import { CREDENTIALS_COOKIE_KEY } from "../app/constants"

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

    if (credentialsCookie) {
      try {
        const credentials = JSON.parse(
          credentialsCookie.value,
        ) as AccessTokenResponse
        request.headers.set(
          "Authorization",
          `Bearer ${credentials.access_token}`,
        )
      } catch {}
    }

    return request
  })

  return client
}
