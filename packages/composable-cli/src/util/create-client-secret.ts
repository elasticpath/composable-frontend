import fetch from "node-fetch"

export async function createApplicationKeys(
  apiUrl: string,
  token: string,
  name?: string
) {
  const result = await postApplicationKeys(apiUrl, token, name)

  return result
}

export async function postApplicationKeys(
  apiUrl: string,
  token: string,
  name?: string
) {
  const resp = await fetch(`${apiUrl}/v2/application-keys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      data: {
        name: name ?? `composable-cli-${new Date().toISOString()}`,
        type: "application_key",
      },
    }),
  })

  const result = await resp.json()

  return result
}
