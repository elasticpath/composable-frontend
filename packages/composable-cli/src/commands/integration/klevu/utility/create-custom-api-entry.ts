import { EpccRequester } from "../../../../util/command"

export async function createCustomApiEntry(
  requester: EpccRequester,
  body: { type: string; slug: string } & Record<string, unknown>,
): Promise<unknown> {
  const response = await requester(`/v2/extensions/${body.slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: body,
    }),
  })

  return response.json()
}
