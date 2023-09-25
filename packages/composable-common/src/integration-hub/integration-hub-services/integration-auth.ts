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

  const url = `${resolveEpccBaseUrl(
    host
  )}/v2/platform-integrations/authentication-token`

  const resp: { data: { jwt_token: string } } = await fetch(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
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
