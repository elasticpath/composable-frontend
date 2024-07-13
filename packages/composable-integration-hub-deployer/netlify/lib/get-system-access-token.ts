import {
  externalIdSchema,
  SupportedIntegrationHubEnvironment,
} from "./schema/external-id-schema"
import { ihAccessTokenResponseSchema } from "./schema/ih-access-token-schema"
import fetch from "node-fetch"
import { OperationResult } from "./types/operation-result"

const ihEnvRefreshTokens = {
  IH_INTEGRATION_SYSTEM_REFRESH_TOKEN:
    process.env.IH_INTEGRATION_SYSTEM_REFRESH_TOKEN,
  IH_STAGING_SYSTEM_REFRESH_TOKEN: process.env.IH_STAGING_SYSTEM_REFRESH_TOKEN,
  IH_PROD_EU_SYSTEM_REFRESH_TOKEN: process.env.IH_PROD_EU_SYSTEM_REFRESH_TOKEN,
  IH_PROD_US_SYSTEM_REFRESH_TOKEN: process.env.IH_PROD_US_SYSTEM_REFRESH_TOKEN,
} as const

const ihEnvHosts: {
  [key in `${SupportedIntegrationHubEnvironment}_host`]: string | undefined
} = {
  "prod-eu_host": process.env.IH_PROD_EU_HOST,
  "prod-us_host": process.env.IH_PROD_US_HOST,
  integration_host: process.env.IH_INTEGRATION_HOST,
  staging_host: process.env.IH_STAGING_HOST,
} as const

export type IHEnvContext = typeof ihEnvRefreshTokens &
  typeof ihEnvHosts & { requester: typeof fetch }

export const getSystemAccessToken = _getSystemAccessToken({
  ...ihEnvRefreshTokens,
  ...ihEnvHosts,
  requester: fetch,
})

export function _getSystemAccessToken(ctx: IHEnvContext) {
  return async function __getSystemAccessToken(
    externalId: string
  ): Promise<OperationResult<{ token: string }>> {
    const refreshTokenResult = getRefreshToken(externalId, ctx)

    if (!refreshTokenResult.success) {
      return {
        success: false,
        code: "GET_REFRESH_TOKEN_FAILED",
        error: refreshTokenResult.error,
      }
    }

    const { token: refreshToken, env } = refreshTokenResult

    const accessTokenResult = await requestSystemIHAccessToken(
      refreshToken,
      env,
      ctx
    )

    if (!accessTokenResult.success) {
      return {
        success: false,
        code: "SYSTEM_IH_ACCESS_TOKEN_FAILED",
        error: accessTokenResult.error,
      }
    }

    return {
      success: true,
      token: accessTokenResult.token,
    }
  }
}

async function requestSystemIHAccessToken(
  refreshToken: string,
  env: SupportedIntegrationHubEnvironment,
  ctx: typeof ihEnvHosts
): Promise<OperationResult<{ token: string }>> {
  const host = `${ctx[`${env}_host`]}`
  try {
    const response = await fetch(`${host}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).then((resp) => resp.json())

    const parsedResponseResult = ihAccessTokenResponseSchema.safeParse(response)

    if (!parsedResponseResult.success) {
      return {
        success: false,
        error: parsedResponseResult.error,
      }
    }

    return {
      success: true,
      token: parsedResponseResult.data.access_token,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error,
      }
    }
    return {
      success: false,
      error: new Error(
        `Unknown error occurred during fetch request to ${host}/auth/refresh`
      ),
    }
  }
}

export function getRefreshToken(
  externalId: string,
  ctx: typeof ihEnvRefreshTokens
): OperationResult<{ token: string; env: SupportedIntegrationHubEnvironment }> {
  const ihEnvResult = resolveIntegrationHubEnvironment(externalId)

  if (!ihEnvResult.success) {
    return {
      success: false,
      code: "RESOLVE_IH_ENV_FAILED",
      ...(ihEnvResult.code && { childCodes: [ihEnvResult.code, ...(ihEnvResult.childCodes ?? [])] }),
      error: ihEnvResult.error,
    }
  }

  const signedKeyResult = resolveEnvironmentRefreshToken(ihEnvResult.env, ctx)

  if (!signedKeyResult.success) {
    return {
      success: false,
      code: "RESOLVE_ENV_REFRESH_TOKEN_FAILED",
      ...(signedKeyResult.code && { childCodes: [signedKeyResult.code, ...(signedKeyResult.childCodes ?? [])] }),
      error: signedKeyResult.error,
    }
  }

  return {
    success: true,
    token: signedKeyResult.token,
    env: ihEnvResult.env,
  }
}

function resolveEnvironmentRefreshToken(
  ihEnv: SupportedIntegrationHubEnvironment,
  ctx: typeof ihEnvRefreshTokens
): OperationResult<{ token: string }> {
  let token: string | undefined
  switch (ihEnv) {
    case "integration":
      token = ctx.IH_INTEGRATION_SYSTEM_REFRESH_TOKEN
      break
    case "staging":
      token = ctx.IH_STAGING_SYSTEM_REFRESH_TOKEN
      break
    case "prod-eu":
      token = ctx.IH_PROD_EU_SYSTEM_REFRESH_TOKEN
      break
    case "prod-us":
      token = ctx.IH_PROD_US_SYSTEM_REFRESH_TOKEN
      break
  }

  if (!token) {
    return {
      success: false,
      error: new Error(
        `Failed to resolve the refresh token for environment ${ihEnv}`
      ),
    }
  }
  return {
    success: true,
    token,
  }
}

function resolveIntegrationHubEnvironment(
  externalId: string
): OperationResult<{ env: SupportedIntegrationHubEnvironment }> {
  try {
    const parsedExternalIdResult = externalIdSchema.safeParse(
      externalId.split("_")
    )

    if (parsedExternalIdResult.success) {
      return {
        success: true,
        env: parsedExternalIdResult.data[1],
      }
    }

    const { name, message, errors } = parsedExternalIdResult.error
    return {
      success: false,
      error: new Error(`${name} - ${message} - ${JSON.stringify(errors)}`),
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error
          : new Error(
              "Unknown error occurred while resolving integration hub environment"
            ),
    }
  }
}
