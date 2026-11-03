import { createConfiguredClient } from "@epcc-sdk/sdks-runtime"
import type { ConfiguredClientOptions } from "@epcc-sdk/sdks-runtime"
import { createClient, createConfig } from "./client/client"
import type { Client, Config } from "./client/client"

export type CartCheckoutOrderClientOptions = ConfiguredClientOptions<Config>

export function createCartCheckoutOrderClient(
  options: CartCheckoutOrderClientOptions,
): Client {
  return createConfiguredClient({ createClient, createConfig }, options)
}
