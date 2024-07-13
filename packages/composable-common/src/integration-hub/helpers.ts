import { ErrorResponse, Response } from "./types"
import { OperationResult, AnyVariables } from "@urql/core"
import { v4 as uuidv4 } from "uuid"
import { ErrorCodes, errorMessages } from "./error-messages"
import { AlgoliaIntegrationCreateFailureResult } from "./schema"
import { EpccRegion } from "./integration-hub-services"

export function handleCatchError(err: unknown): Error {
  return err instanceof Error ? err : new Error("Unknown error occurred")
}

export function processAsIntegrationHubErrorResponse<
  Data = any,
  Variables extends AnyVariables = AnyVariables,
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
  response: Response<T>,
): response is ErrorResponse {
  return !response.success
}

export function resolveErrorResponse(
  code: ErrorCodes,
  error?: Error,
): AlgoliaIntegrationCreateFailureResult {
  return {
    success: false,
    name: "algolia",
    code,
    reason: errorMessages[code],
    error,
  }
}

export function resolveIntegrationHubBaseUrl(region: EpccRegion): string {
  return `https://${resolveIntegrationHubHost(
    region,
  )}.elasticpathintegrations.com/api/`
}

export function resolveIntegrationHubHost(region: EpccRegion): string {
  switch (region) {
    case "eu-west":
      return "eu-west-1"
    case "us-east":
      return "us-east-2"
    default:
      // Falling back to a default of us-east-2
      return "us-east-2"
  }
}
