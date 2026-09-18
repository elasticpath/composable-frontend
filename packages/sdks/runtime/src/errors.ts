/**
 * - `http` — a non-2xx from the endpoint.
 * - `parse` — a 2xx whose body is not JSON, e.g. a gateway or login page.
 * - `missing_token` — a 2xx of valid JSON with no `access_token`.
 * - `network` — no response at all; `status` 0, `body` "", `cause` is what fetch threw.
 */
export type TokenRequestReason = "http" | "parse" | "missing_token" | "network"

export interface TokenRequestFailure {
  reason: TokenRequestReason
  status: number
  body: string
  url: string
  message: string
  cause?: unknown
}

export class TokenRequestError extends Error {
  readonly name = "TokenRequestError"
  readonly reason: TokenRequestReason
  readonly status: number
  readonly body: string
  readonly url: string
  readonly cause?: unknown

  constructor(message: string, init: Omit<TokenRequestFailure, "message">) {
    super(message)
    this.reason = init.reason
    this.status = init.status
    this.body = init.body
    this.url = init.url
    if (init.cause !== undefined) {
      this.cause = init.cause
    }
    Object.setPrototypeOf(this, TokenRequestError.prototype)
  }

  toFailure(): TokenRequestFailure {
    return {
      reason: this.reason,
      status: this.status,
      body: this.body,
      url: this.url,
      message: this.message,
      ...(this.cause !== undefined ? { cause: this.cause } : {}),
    }
  }
}
