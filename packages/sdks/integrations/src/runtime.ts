import { createConfiguredClient } from "@epcc-sdk/sdks-runtime"
import type { ConfiguredClientOptions } from "@epcc-sdk/sdks-runtime"
import { createClient, createConfig } from "./client/client"
import type { Client, Config } from "./client/client"

export type IntegrationsClientOptions = ConfiguredClientOptions<Config>

// This spec's paths start at /integrations and its servers carry the /v2, but
// the token endpoint sits at the host root. baseUrl is the host, as for every
// other package, and the operations get baseUrl + "/v2".
export function createIntegrationsClient(
  options: IntegrationsClientOptions,
): Client {
  const host = options.baseUrl.replace(/\/(v2\/?)?$/, "")
  return createConfiguredClient<Client, Config>(
    { createClient, createConfig },
    {
      ...options,
      baseUrl: host,
      config: { baseUrl: `${host}/v2`, ...options.config },
    },
  )
}
