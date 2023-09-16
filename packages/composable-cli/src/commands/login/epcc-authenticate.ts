import fetch from "node-fetch"
import { encodeObjectToQueryString } from "../../util/encode-object-to-query-str"

export async function authenticateGrantTypePassword(
  apiUrl: string,
  username: string,
  password: string
): Promise<unknown> {
  const body = {
    grant_type: "password",
    username,
    password,
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
