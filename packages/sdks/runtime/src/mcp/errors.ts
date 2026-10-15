export type ToolCallFailureReason =
  | "invalid_input"
  | "http"
  | "network"
  | "unknown_tool"

export interface ToolCallFailure {
  reason: ToolCallFailureReason
  status?: number
  pointer?: string
  body?: unknown
  cause?: unknown
}

export class ToolCallError extends Error {
  readonly name = "ToolCallError"
  readonly reason: ToolCallFailureReason
  readonly status: number
  readonly pointer?: string
  readonly body?: unknown
  readonly cause?: unknown

  constructor(message: string, failure: ToolCallFailure) {
    super(message)
    this.reason = failure.reason
    this.status = failure.status ?? 0
    if (failure.pointer !== undefined) this.pointer = failure.pointer
    if (failure.body !== undefined) this.body = failure.body
    if (failure.cause !== undefined) this.cause = failure.cause
    Object.setPrototypeOf(this, ToolCallError.prototype)
  }
}
