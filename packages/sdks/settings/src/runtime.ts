import { createConfiguredClient } from "@epcc-sdk/sdks-runtime"
import type { ConfiguredClientOptions } from "@epcc-sdk/sdks-runtime"
import { createClient, createConfig } from "./client/client"
import type { Client, Config } from "./client/client"

export type SettingsClientOptions = ConfiguredClientOptions<Config>

export function createSettingsClient(
  options: SettingsClientOptions,
): Client {
  return createConfiguredClient({ createClient, createConfig }, options)
}
