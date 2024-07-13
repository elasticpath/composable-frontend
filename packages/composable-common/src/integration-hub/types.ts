import { errorMessages } from "./error-messages"

export type Response<T> = SuccessResponse<T> | ErrorResponse

interface SuccessResponse<T> {
  success: true
  data: T
}

export interface ErrorResponse {
  success: false
  error: Error
}

export type AlgoliaIntegrationSetupResponse =
  | AlgoliaIntegrationSetupResponseSuccess
  | AlgoliaIntegrationSetupResponseFailure

export type AlgoliaIntegrationSetupResponseErrorCode =
  keyof typeof errorMessages

export interface AlgoliaIntegrationSetupResponseSuccess {
  success: true
  result: any
}

export interface AlgoliaIntegrationSetupResponseFailure {
  success: false
  code: AlgoliaIntegrationSetupResponseErrorCode
  reason: string
  error?: Error
}
