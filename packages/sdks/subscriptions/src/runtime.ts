import { createConfiguredClient } from "@epcc-sdk/sdks-runtime"
import type { ConfiguredClientOptions } from "@epcc-sdk/sdks-runtime"
import { createClient, createConfig } from "./client/client"
import type { Client, Config } from "./client/client"

export type SubscriptionsClientOptions = ConfiguredClientOptions<Config>

export function createSubscriptionsClient(
  options: SubscriptionsClientOptions,
): Client {
  return createConfiguredClient({ createClient, createConfig }, options)
}
