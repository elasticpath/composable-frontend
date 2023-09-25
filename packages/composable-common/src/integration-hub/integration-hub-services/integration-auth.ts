import { Response } from "../types"
import fetch from "node-fetch"
import { resolveEpccBaseUrl } from "../../utility/resolve-epcc-url"

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
  accessToken: string
): Promise<Response<AuthResponseData>> {
  const url = `${resolveEpccBaseUrl(
    host
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

  return { success: true, data: { jwtToken: resp.data.jwt_token } }
}

function isSuccessResponse(
  resp: unknown
): resp is IntegrationHubAuthSuccessResponse {
  return typeof resp === "object" && resp !== null && "data" in resp
}
