import { errorMessages } from "./error-messages"

export type SetupResponse = SetupResponseSuccess | SetupResponseFailure

export type SetupResponseErrorCode = keyof typeof errorMessages

export interface SetupResponseSuccess {
  success: true
  result: any
}

export interface SetupResponseFailure {
  success: false
  code: SetupResponseErrorCode
  reason: string
  error?: Error
}
