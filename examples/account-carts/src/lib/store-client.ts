import { createClient } from "@epcc-sdk/sdks-shopper"

export function storeEndpoint(): string | undefined {
  return process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL
}

export function createStoreClient() {
  return createClient({ baseUrl: storeEndpoint() })
}
