import { encodeObjectToQueryString } from "../../util/encode-object-to-query-str"
import { EpccRequester } from "../../util/command"

export async function authenticateGrantTypePassword(
  requester: EpccRequester,
  username: string,
  password: string,
): Promise<unknown> {
  const body = {
    grant_type: "password",
    username,
    password,
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
