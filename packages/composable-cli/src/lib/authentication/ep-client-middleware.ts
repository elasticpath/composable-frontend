import { CommandContext } from "../../types/command"
import { MiddlewareFunction } from "yargs"
import { getCredentials, getToken } from "./get-token"
import { gateway, MemoryStorageFactory, Moltin } from "@moltin/sdk"
import Conf from "conf"
import {
  getRegion,
  resolveHostFromRegion,
  resolveHostNameFromRegion,
} from "../../util/resolve-region"

export function createEpClientMiddleware(
  ctx: CommandContext,
): MiddlewareFunction {
  return async function epClientMiddleware(_argv: any) {
    const { store } = ctx

    const credentialsResult = getCredentials(store)

    if (credentialsResult.success) {
      ctx.epClient = createEpccClient(store)
    }

    return
  }
}

function createEpccClient(store: Conf): Moltin {
  const regionResult = getRegion(store)
  if (!regionResult.success) {
    throw new Error(
      "No region found - ep client custom authenticator - are you authetnicated? - `composable-cli login`",
    )
  }

  const hostname = resolveHostNameFromRegion(regionResult.data)
  const resolvedRegion = resolveHostFromRegion(regionResult.data)

  return gateway({
    host: hostname,
    custom_authenticator: async () => {
      await getToken(resolvedRegion, store)

      const credentialsResult = getCredentials(store)

      if (!credentialsResult.success) {
        throw new Error(
          `Credentials not found in store: ${credentialsResult.error.message} - ep client custom authenticator`,
        )
      }

      return credentialsResult.data
    },
    custom_fetch: fetch,
    reauth: false,
    disableCart: true,
    storage: new MemoryStorageFactory(),
  })
}
