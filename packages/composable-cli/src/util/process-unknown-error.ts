import { CLITaskError } from "../lib/error/cli-task-error"

export function processUnknownError(error: unknown): string {
  let errorMessage = "Error"

  if (error instanceof CLITaskError) {
    if (error.code) {
      errorMessage += `: ${error.code}`
    }

    if (error.description) {
      errorMessage += `: ${error.description}`
    }

    if (error.taskName) {
      errorMessage += `: ${error.taskName}`
    }
  }

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
