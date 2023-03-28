import { Response } from "../types"
import type { Moltin } from "@moltin/sdk"
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
  client: Moltin
): Promise<Response<AuthResponseData>> {
  const host = client.config.host
  const { access_token } = await client.Authenticate()

  const resp: { data: { jwt_token: string } } = await fetch(
    `${resolveEpccBaseUrl(host)}/v2/platform-integrations/authentication-token`,
    {
      headers: {
        Authorization: access_token,
      },
    }
  ).then((resp) => resp.json())

  return isSuccessResponse(resp)
    ? { success: true, data: { jwtToken: resp.data.jwt_token } }
    : {
        success: false,
        error: new Error("Failed to get integrations authentication token."),
      }
}

function isSuccessResponse(
  resp: unknown
): resp is IntegrationHubAuthSuccessResponse {
  return typeof resp === "object" && resp !== null && "data" in resp
}
