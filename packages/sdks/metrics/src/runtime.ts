import { createConfiguredClient } from "@epcc-sdk/sdks-runtime"
import type { ConfiguredClientOptions } from "@epcc-sdk/sdks-runtime"
import { createClient, createConfig } from "./client/client"
import type { Client, Config } from "./client/client"

export type MetricsClientOptions = ConfiguredClientOptions<Config>

export function createMetricsClient(
  options: MetricsClientOptions,
): Client {
  return createConfiguredClient({ createClient, createConfig }, options)
}
