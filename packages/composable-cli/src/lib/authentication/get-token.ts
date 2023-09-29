import Conf from "conf"
import fetch from "node-fetch"
import {
  Credentials,
  credentialsResponseSchema,
  credentialsSchema,
} from "./credentials-schema"
import { hasExpiredWithThreshold } from "../../util/has-expired"
import { Result } from "../../types/results"
import { EPCCErrorResponse } from "../epcc-error-schema"
import {
  checkIsErrorResponse,
  resolveEPCCErrorMessage,
} from "../../util/epcc-error"
import {
  handleClearCredentials,
  storeCredentials,
  storeUserStore,
} from "../../util/conf-store/store-credentials"
import { getStore } from "../stores/get-store"
import {
  UserSwitchStoreResponse,
  userSwitchStoreResponseSchema,
} from "../stores/switch-store-schema"
import { encodeObjectToQueryString } from "../../util/encode-object-to-query-str"

export function getCredentials(store: Conf): Result<Credentials, Error> {
  const credentials = credentialsSchema.safeParse(store.get("credentials"))

  if (!credentials.success) {
    return {
      success: false,
      error: new Error(
        `Credentials not found in store: ${credentials.error.message}`,
      ),
    }
  }

  return {
    success: true,
    data: credentials.data,
  }
}

export async function getToken(
  apiUrl: string,
  store: Conf,
): Promise<Result<string, GetTokenError>> {
  const credentialsResult = getCredentials(store)

  if (!credentialsResult.success) {
    return {
      success: false,
      error: new Error(
        `Credentials not found in store: ${credentialsResult.error.message}`,
      ),
    }
  }

  const { expires, refresh_token, access_token } = credentialsResult.data

  if (
    hasExpiredWithThreshold(
      expires,
      300, // 5 minutes
    )
  ) {
    return handleExpiredToken(store, apiUrl, refresh_token)
  }

  // Switch EP store if there is an active store
  await switchStoreIfActive(store, apiUrl, credentialsResult.data.access_token)

  return {
    success: true,
    data: access_token,
  }
}

async function handleExpiredToken(
  store: Conf,
  apiUrl: string,
  refresh_token: string,
): Promise<Result<string, GetTokenError>> {
  store.delete("credentials")

  const renewedToken = await renewToken(apiUrl, refresh_token)

  if (!renewedToken.success) {
    handleClearCredentials(store)
    return {
      success: false,
      error: renewedToken.error,
    }
  }

  // Set credentials in conf store
  storeCredentials(store, renewedToken.data)

  // Switch EP store if there is an active store
  await switchStoreIfActive(store, apiUrl, renewedToken.data.access_token)

  return {
    success: true,
    data: renewedToken.data.access_token,
  }
}

async function switchStoreIfActive(store: Conf, apiUrl: string, token: string) {
  const activeStoreResult = await getStore(store)
  if (activeStoreResult.success) {
    const switchStoreResponse = await switchUserStore(
      apiUrl,
      token,
      activeStoreResult.data.id,
    )

    if (switchStoreResponse.success) {
      storeUserStore(store, activeStoreResult.data)
    }
  } else {
    store.delete("store")
  }
}

export type GetTokenError = EPCCErrorResponse | Error

async function renewToken(
  apiUrl: string,
  refreshToken: string,
): Promise<Result<Credentials, GetTokenError>> {
  const renewalResponse = await authenticateRefreshTokenRaw(
    apiUrl,
    refreshToken,
  )
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
        resolveEPCCErrorMessage(credentialsResponse.data.errors),
      ),
    }
  }

  return {
    success: true,
    data: credentialsResponse.data,
  }
}

export async function switchUserStore(
  apiUrl: string,
  token: string,
  storeId: string,
): Promise<Result<UserSwitchStoreResponse, Error>> {
  const switchResult = await postSwitchUserStore(apiUrl, token, storeId)

  const parsedResult = userSwitchStoreResponseSchema.safeParse(switchResult)

  if (!parsedResult.success) {
    return {
      success: false,
      error: new Error(parsedResult.error.message),
    }
  }

  return {
    success: true,
    data: parsedResult.data,
  }
}

export async function postSwitchUserStore(
  apiUrl: string,
  token: string,
  storeId: string,
): Promise<unknown> {
  const response = await fetch(
    `${apiUrl}/v1/account/stores/switch/${storeId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  )

  return response.json()
}

export async function authenticateRefreshTokenRaw(
  apiUrl: string,
  refreshToken: string,
): Promise<unknown> {
  const body = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  }

  const response = await fetch(`${apiUrl}/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeObjectToQueryString(body),
  })

  return await response.json()
}
