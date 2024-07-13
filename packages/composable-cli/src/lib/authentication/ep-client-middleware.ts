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
import { logging } from "@angular-devkit/core"

export function createEpClientMiddleware(
  ctx: CommandContext,
): MiddlewareFunction {
  return async function epClientMiddleware(_argv: any) {
    const { store } = ctx

    const credentialsResult = getCredentials(store)

    if (credentialsResult.success) {
      ctx.epClient = createEpccClient(store, ctx.logger)
    }

    return
  }
}

function createEpccClient(store: Conf, logger: logging.Logger): Moltin {
  const regionResult = getRegion(store)
  if (!regionResult.success) {
    logger.error("No region found - ep client custom authenticator")
    throw new Error(
      "No region found - ep client custom authenticator - are you authenticated? - `composable-cli login`",
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
        logger.debug(
          `Credentials not found in store: ${credentialsResult.error.message} - ep client custom authenticator`,
        )
        throw new Error(
          `Credentials not found in store: ${credentialsResult.error.message} - ep client custom authenticator`,
        )
      }

      return credentialsResult.data
    },
    custom_fetch: (url: URL | RequestInfo, init?: RequestInit) => {
      logger.debug("\nEP SDK Client Fetch")
      logger.debug(JSON.stringify(url, null, 2))
      logger.debug(JSON.stringify(init, null, 2))
      return fetch(url, init)
    },
    reauth: false,
    disableCart: true,
    storage: new MemoryStorageFactory(),
  })
}
