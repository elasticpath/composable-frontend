import { EPCCErrorResponse } from "../lib/epcc-error-schema"

export function checkIsErrorResponse(
  response: any
): response is EPCCErrorResponse {
  return !!response && "errors" in response
}

export function resolveEPCCErrorMessage(
  errors: EPCCErrorResponse["errors"]
): string {
  // TODO: extract all the errors if it's an array and process into a useful message.
  const extractedError = Array.isArray(errors) ? errors[0] : errors

  return extractedError.detail ? extractedError.detail : extractedError.title
}
