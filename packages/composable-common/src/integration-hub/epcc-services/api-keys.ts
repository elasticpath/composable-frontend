import { Response } from "../types"
import type { Moltin } from "@moltin/sdk"

export async function createEpccApiKey(
  client: Moltin,
  name: string
): Promise<
  Response<Awaited<ReturnType<typeof client.ApplicationKeys.Create>>["data"]>
> {
  return client.ApplicationKeys.Create({ type: "application_key", name }).then(
    (resp) => ({
      success: true,
      data: resp.data,
    })
  )
}
