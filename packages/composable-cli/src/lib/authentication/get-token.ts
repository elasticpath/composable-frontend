import Conf from "conf"
import {
  Credentials,
  credentialsResponseSchema,
  credentialsSchema,
} from "./credentials-schema"
import { authenticateRefreshToken } from "../../commands/login/epcc-authenticate"
import { hasExpiredWithThreshold } from "../../util/has-expired"
import { Result } from "../../types/results"
import { EPCCErrorResponse } from "../epcc-error-schema"
import {
  checkIsErrorResponse,
  resolveEPCCErrorMessage,
} from "../../util/epcc-error"

export async function getToken(
  apiUrl: string,
  store: Conf
): Promise<Result<string, GetTokenError>> {
  const credentials = credentialsSchema.safeParse(store.get("credentials"))

  if (!credentials.success) {
    return {
      success: false,
      error: new Error(
        `Credentials not found in store: ${credentials.error.message}`
      ),
    }
  }

  // console.log(
  //   "get token called: ",
  //   credentials,
  //   hasExpiredWithThreshold(
  //     credentials.data.expires,
  //     credentials.data.expires_in,
  //     300 // 5 minutes
  //   )
  // )

  if (
    hasExpiredWithThreshold(
      credentials.data.expires,
      credentials.data.expires_in,
      300 // 5 minutes
    )
  ) {
    const renewedToken = await renewToken(
      apiUrl,
      credentials.data.refresh_token
    )

    console.log(
      "CALL WAS MADE TO RENEW TOKEN DID YOU EXPECT THIS? ",
      renewedToken
    )

    if (!renewedToken.success) {
      return {
        success: false,
        error: renewedToken.error,
      }
    }

    store.set("credentials", renewedToken.data)
    return {
      success: true,
      data: renewedToken.data.access_token,
    }
  }

  return {
    success: true,
    data: credentials.data.access_token,
  }
}

export type GetTokenError = EPCCErrorResponse | Error

async function renewToken(
  apiUrl: string,
  refreshToken: string
): Promise<Result<Credentials, GetTokenError>> {
  const renewalResponse = await authenticateRefreshToken(apiUrl, refreshToken)
  const credentialsResponse =
    credentialsResponseSchema.safeParse(renewalResponse)

  if (!credentialsResponse.success) {
    return {
      success: false,
      error: new Error(credentialsResponse.error.message),
    }
  }

  if (checkIsErrorResponse(credentialsResponse.data)) {
    return {
      success: false,
      error: new Error(
        resolveEPCCErrorMessage(credentialsResponse.data.errors)
      ),
    }
  }

  return {
    success: true,
    data: credentialsResponse.data,
  }
}
