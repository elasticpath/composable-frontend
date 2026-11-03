import { createConfiguredClient } from "@epcc-sdk/sdks-runtime"
import type { ConfiguredClientOptions } from "@epcc-sdk/sdks-runtime"
import { createClient, createConfig } from "./client/client"
import type { Client, Config } from "./client/client"

export type AccountsAddressesClientOptions = ConfiguredClientOptions<Config>

/**
 * An account addresses client with a token source, the `auth` hook and a
 * `fetch` that refreshes on a 401 and backs off on a 429 already wired.
 *
 * The generated `createClient` and `createConfig` are bound here so a consumer
 * installs this package alone. Everything the factory sets is overridable
 * through `config`, and the pieces are re-exported below for a stack that needs
 * to be assembled by hand.
 */
export function createAccountsAddressesClient(
  options: AccountsAddressesClientOptions,
): Client {
  return createConfiguredClient({ createClient, createConfig }, options)
}
