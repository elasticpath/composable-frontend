import { Result } from "../types/results"
import {
  ApplicationWithSecretKey,
  createApplicationKeyResponseSchema,
} from "./application-keys-schema"
import { checkIsErrorResponse, resolveEPCCErrorMessage } from "./epcc-error"
import { EpccRequester } from "./command"

export async function createApplicationKeys(
  requester: EpccRequester,
  name?: string,
): Promise<Result<ApplicationWithSecretKey, Error>> {
  const result = await postApplicationKeys(requester, name)

  const parsedResult = createApplicationKeyResponseSchema.safeParse(result)

  if (!parsedResult.success) {
    return {
      success: false,
      error: new Error(parsedResult.error.issues.toString()),
    }
  }

  if (checkIsErrorResponse(parsedResult.data)) {
    return {
      success: false,
      error: new Error(resolveEPCCErrorMessage(parsedResult.data.errors)),
    }
  }

  return {
    success: true,
    data: parsedResult.data.data,
  }
}

export async function postApplicationKeys(
  requester: EpccRequester,
  name?: string,
): Promise<unknown> {
  const resp = await requester(`/v2/application-keys`, {
    method: "POST",
    headers: {
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
