import { encodeObjectToQueryString } from "../../util/encode-object-to-query-str"
import { EpccRequester } from "../../util/command"
import { resolveHostFromRegion } from "../../util/resolve-region"
import { Region } from "../../lib/stores/region-schema"

export async function authenticateGrantTypePassword(
  username: string,
  password: string,
  region: Region,
): Promise<unknown> {
  const body = {
    grant_type: "password",
    username,
    password,
  }

  const url = new URL(`/oauth/access_token`, resolveHostFromRegion(region))

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeObjectToQueryString(body),
  })

  return await response.json()
}

export async function authenticateRefreshToken(
  requester: EpccRequester,
  refreshToken: string,
): Promise<unknown> {
  const body = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  }

  const response = await requester(`/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeObjectToQueryString(body),
  })

  return await response.json()
}
