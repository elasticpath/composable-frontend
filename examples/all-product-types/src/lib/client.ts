import { client, type AccessTokenResponse } from "@epcc-sdk/sdks-shopper"
import { cookies } from "next/headers"
import { CREDENTIALS_COOKIE_KEY } from "../app/constants"

/**
 * Configures the Elastic Path Commerce Cloud SDK client
 *
 * This function sets up:
 * 1. Base URL for API requests
 * 2. Authentication interceptor to automatically add Bearer tokens
 * 3. Multi-location inventory header for advanced inventory features
 *
 * Educational note: This explicit configuration function ensures consistent
 * API communication across the entire application. Call this once per page
 * that uses the SDK to ensure proper setup.
 *
 * @example
 * ```typescript
 * import { configureClient } from "../lib/client"
 *
 * export default async function ProductPage() {
 *   configureClient() // Set up the SDK client
 *
 *   const response = await getByContextProduct({...})
 * }
 * ```
 */
export function configureClient(): void {
  // Configure the base URL for all API requests
  client.setConfig({
    baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL!,
  })

  /**
   * Authentication Interceptor
   *
   * Automatically attaches the authentication token to all API requests.
   * The token is stored securely in server-side cookies by the middleware.
   *
   * Educational note: Interceptors are a powerful pattern for cross-cutting
   * concerns like authentication, logging, and error handling.
   */
  client.interceptors.request.use(async (request, options) => {
    const credentials = JSON.parse(
      (await cookies()).get(CREDENTIALS_COOKIE_KEY)?.value ?? "",
    ) as AccessTokenResponse | undefined

    if (credentials?.access_token) {
      request.headers.set("Authorization", `Bearer ${credentials.access_token}`)
    }

    return request
  })

  /**
   * Multi-Location Inventory Interceptor
   *
   * Enables Elastic Path's Multi-Location Inventory (MLI) feature by adding
   * the required header to all requests. This allows tracking inventory
   * across multiple warehouses, stores, or distribution centers.
   *
   * Educational note: MLI provides more granular inventory control compared
   * to basic inventory, essential for B2B scenarios with multiple locations.
   */
  client.interceptors.request.use(async (request, options) => {
    request.headers.set("EP-Inventories-Multi-Location", "true")
    return request
  })
}
