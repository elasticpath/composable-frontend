export function processUnknownError(error: unknown): string {
  let errorMessage = "An unknown error occurred"

  if (error instanceof Error) {
    if (error.message) {
      errorMessage += `: ${error.message}`
    }

    if (error.stack) {
      errorMessage += `\nStack Trace:\n${error.stack}`
    }
  }

  return errorMessage
}
