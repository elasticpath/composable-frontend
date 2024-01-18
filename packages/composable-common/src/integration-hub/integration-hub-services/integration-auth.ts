import { Response } from "../types"
import fetch from "node-fetch"
import { resolveEpccBaseUrl } from "../../utility/resolve-epcc-url"
import { resolveIntegrationHubHost } from "../helpers"
import { resolveRegion } from "../../utility"

interface AuthResponseData {
  jwtToken: string
}

type IntegrationHubAuthSuccessResponse = {
  data: {
    jwt_token: string
  }
}

export async function integrationAuthToken(
  host: string,
  accessToken: string,
): Promise<Response<AuthResponseData>> {
  const url = `${resolveEpccBaseUrl(
    host,
  )}/v2/platform-integrations/authentication-token`

  const resp: { data: { jwt_token: string } } = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((resp) => resp.json())

  if (!isSuccessResponse(resp)) {
    return {
      success: false,
      error: new Error("Failed to get integrations authentication token."),
    }
  }

  const jwtToken = resp.data.jwt_token

  /**
   * Must authenticate the token using the embedded endpoint or the user profile fails to fetch for new users
   */
  const embeddedAuthenticationResult = await embeddedAuthentication(
    host,
    jwtToken,
  )

  if (!embeddedAuthenticationResult.success) {
    return {
      success: false,
      error: new Error(
        "Failed to embedded authenticate integrations authentication token.",
      ),
    }
  }

  return { success: true, data: { jwtToken } }
}

export async function embeddedAuthentication(
  host: string,
  ihToken: string,
): Promise<Response<{ ihToken: string }>> {
  const url = `https://${resolveIntegrationHubHost(
    resolveRegion(host),
  )}.elasticpathintegrations.com/embedded/authenticate`

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ihToken}`,
    },
  })

  if (!resp.ok) {
    return {
      success: false,
      error: new Error(
        "Failed to embedded authenticate integrations authentication token.",
      ),
    }
  }

  return { success: true, data: { ihToken } }
}

function isSuccessResponse(
  resp: unknown,
): resp is IntegrationHubAuthSuccessResponse {
  return typeof resp === "object" && resp !== null && "data" in resp
}
