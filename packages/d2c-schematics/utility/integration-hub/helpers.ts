import {
  AlgoliaIntegrationSetupResponseErrorCode,
  AlgoliaIntegrationSetupResponseFailure,
  ErrorResponse,
  Response,
} from "./types"
import { AnyVariables } from "@urql/core/dist/types/types"
import { OperationResult } from "@urql/core"
import { v4 as uuidv4 } from "uuid"
import { errorMessages } from "./error-messages"

export function handleCatchError(err: unknown): Error {
  return err instanceof Error ? err : new Error("Unknown error occurred")
}

export function processAsIntegrationHubErrorResponse<
  Data = any,
  Variables extends AnyVariables = AnyVariables
>(result: OperationResult<Data, Variables>): ErrorResponse {
  if (result.error) {
    return {
      success: false,
      error: new Error(`${result.error?.name} - ${result.error?.message}`),
    }
  }
  return {
    success: false,
    error: new Error("No error information was provided."),
  }
}

export function createWebhookSecretKey(): string {
  return uuidv4()
}

export function didRequestFail<T>(
  response: Response<T>
): response is ErrorResponse {
  return !response.success
}

export function resolveErrorResponse(
  code: AlgoliaIntegrationSetupResponseErrorCode,
  error?: Error
): AlgoliaIntegrationSetupResponseFailure {
  return {
    success: false,
    code,
    reason: errorMessages[code],
    error,
  }
}
