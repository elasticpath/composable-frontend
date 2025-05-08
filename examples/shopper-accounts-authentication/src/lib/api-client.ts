import { client, AccessTokenResponse } from "@epcc-sdk/sdks-shopper"
import { cookies } from "next/headers"
import { CREDENTIALS_COOKIE_KEY } from "../app/constants"

/**
 * Configures the API client for server-side API calls
 * Sets the base URL and adds an interceptor to include auth token
 */
export function configureClient() {
  // Set the base URL
  client.setConfig({
    baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL!,
  })

  // Add interceptor to include auth token in requests
  client.interceptors.request.use(async (request, options) => {
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
      } catch (error) {
        console.error("Failed to parse credentials cookie:", error)
      }
    }

    return request
  })

  return client
}
