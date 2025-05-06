import { createClient } from "@epcc-sdk/sdks-shopper"
import { applyDefaultNextMiddleware } from "@epcc-sdk/sdks-nextjs"

export function createElasticPathClient() {
  const client = createClient({
    baseUrl: `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}`,
  })

  // Apply Next.js middleware for handling auth tokens and cookies
  applyDefaultNextMiddleware(client)

  return client
}
