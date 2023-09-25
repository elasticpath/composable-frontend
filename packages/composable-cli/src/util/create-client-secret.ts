import fetch from "node-fetch"
import { Result } from "../types/results"
import {
  ApplicationWithSecretKey,
  createApplicationKeyResponseSchema,
} from "./application-keys-schema"
import { checkIsErrorResponse, resolveEPCCErrorMessage } from "./epcc-error"

export async function createApplicationKeys(
  apiUrl: string,
  token: string,
  name?: string
): Promise<Result<ApplicationWithSecretKey, Error>> {
  const result = await postApplicationKeys(apiUrl, token, name)

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
  apiUrl: string,
  token: string,
  name?: string
): Promise<unknown> {
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
