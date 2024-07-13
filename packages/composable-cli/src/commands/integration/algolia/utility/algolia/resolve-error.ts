import { errorMessages } from "./error-messages"
import { SetupResponseErrorCode, SetupResponseFailure } from "./types"

export function resolveErrorResponse(
  code: SetupResponseErrorCode,
  error?: Error
): SetupResponseFailure {
  return {
    success: false,
    code,
    reason: errorMessages[code],
    error,
  }
}
