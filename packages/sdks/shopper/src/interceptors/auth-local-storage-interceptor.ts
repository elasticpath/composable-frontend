import { Client } from "@hey-api/client-fetch"
import { CREDENTIALS_STORAGE_KEY } from "../constants/credentials"
import { AccessTokenResponse, createAnAccessToken } from "../client"
import { tokenExpired } from "../utils/token-expired"

export function createAuthLocalStorageInterceptor(createOptions: {
  storageKey?: string
  clientId: string
  autoRefresh?: boolean
  autoStoreCredentials?: boolean
}): Parameters<Client["interceptors"]["request"]["use"]>[0] {
  return async function authCookieInterceptor(request, _options) {
    const {
      storageKey = CREDENTIALS_STORAGE_KEY,
      clientId,
      autoRefresh = true,
      autoStoreCredentials = true,
    } = createOptions

    // Bypass interceptor logic for token requests to prevent infinite loop
    if (request.url?.includes("/oauth/access_token")) {
      return request
    }

    let credentials = JSON.parse(localStorage.getItem(storageKey) ?? "{}") as
      | AccessTokenResponse
      | undefined

    // Create a new token if...
    if (
      // We don't have a token and auto-storing is enabled
      (!credentials?.access_token && autoStoreCredentials) ||
      // OR token exists but is expired and auto-refresh is enabled
      (credentials?.access_token &&
        credentials.expires &&
        tokenExpired(credentials.expires) &&
        autoRefresh)
    ) {
      if (!clientId) {
        throw new Error("Missing storefront client id")
      }
      const authResponse = await createAnAccessToken({
        body: {
          grant_type: "implicit",
          client_id: clientId,
        },
      })

      if (!authResponse.data) {
        throw new Error("Failed to get access token")
      }

      credentials = authResponse.data
      // Store the credentials in localStorage
      localStorage.setItem(storageKey, JSON.stringify(credentials))
    }

    if (credentials?.access_token) {
      request.headers.set("Authorization", `Bearer ${credentials.access_token}`)
    }
    return request
  }
}
