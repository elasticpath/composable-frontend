export type CLITaskErrorOptions = {
  message: string
  code: CLITaskErrorCode
  taskName: string
  description?: string
}

export type CLITaskErrorCode =
  | "missing_expected_context_data"
  | "request_failure"

export class CLITaskError extends Error {
  /**
   * Unique error code for the error.
   */
  public code: CLITaskErrorCode
  /**
   * The name of the task that failed.
   */
  public taskName: string
  /**
   * A description of the error that is more details than the message you want to show to the user.
   */
  public description: string | undefined

  constructor({ message, code, taskName, description }: CLITaskErrorOptions) {
    super(message)
    this.name = "CLITaskError"
    this.code = code
    this.taskName = taskName
    this.description = description
  }
}
