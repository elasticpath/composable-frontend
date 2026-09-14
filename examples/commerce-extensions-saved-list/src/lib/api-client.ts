import { client, type AccessTokenResponse } from "@epcc-sdk/sdks-shopper"
import { cookies } from "next/headers"
import { CREDENTIALS_COOKIE_KEY } from "../app/constants"

/**
 * The shopper client: catalog reads and the login call, authorised by the
 * implicit token the middleware puts in a cookie.
 *
 * This client never touches the saved list. Implicit tokens are read-only, so
 * it could not write one, and it can read every shopper's entries, so it must
 * not read one either.
 */
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
      } catch {
        // A malformed cookie is replaced by the middleware on the next request.
      }
    }

    return request
  })

  return client
}
