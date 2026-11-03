import { createConfiguredClient } from "@epcc-sdk/sdks-runtime"
import type { ConfiguredClientOptions } from "@epcc-sdk/sdks-runtime"
import { createClient, createConfig } from "./client/client"
import type { Client, Config } from "./client/client"

export type CatalogsClientOptions = ConfiguredClientOptions<Config>

/** A catalogs client with authentication, refresh on a 401 and backoff on a 429 wired in. */
export function createCatalogsClient(options: CatalogsClientOptions): Client {
  return createConfiguredClient({ createClient, createConfig }, options)
}
