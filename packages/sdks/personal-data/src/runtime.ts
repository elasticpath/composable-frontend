import { createConfiguredClient } from "@epcc-sdk/sdks-runtime"
import type { ConfiguredClientOptions } from "@epcc-sdk/sdks-runtime"
import { createClient, createConfig } from "./client/client"
import type { Client, Config } from "./client/client"

export type PersonalDataClientOptions = ConfiguredClientOptions<Config>

export function createPersonalDataClient(
  options: PersonalDataClientOptions,
): Client {
  return createConfiguredClient({ createClient, createConfig }, options)
}
