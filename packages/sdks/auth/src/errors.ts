/**
 * Why a token request failed.
 *
 * - `http` — the endpoint answered with a non-2xx status. `status` and `body`
 *   are what it said.
 * - `parse` — a 2xx whose body is not JSON. A gateway or login page in front of
 *   the API looks like this.
 * - `missing_token` — a 2xx carrying valid JSON with no `access_token`.
 * - `network` — the request never produced a response. `cause` is what fetch
 *   threw, `status` is 0 and `body` is empty.
 *
 * Present so a caller can switch on the kind of failure instead of inferring it
 * from the status code.
 */
export type TokenRequestReason = "http" | "parse" | "missing_token" | "network"

/**
 * The detail handed to a `mapError` hook. The same fields the thrown
 * `TokenRequestError` carries, as plain data, so a caller can build an error of
 * its own vocabulary without depending on this package's error class.
 */
export interface TokenRequestFailure {
  reason: TokenRequestReason
  /** HTTP status, or 0 when there was no response (`reason: "network"`). */
  status: number
  /** Raw response body, or "" when there was no response. */
  body: string
  /** The token endpoint that was called. */
  url: string
  /** This package's own description of the failure. */
  message: string
  /** What fetch threw, for `reason: "network"` only. */
  cause?: unknown
}

/**
 * A token endpoint returned something unusable. Carries the HTTP status and the
 * raw response body so the caller can see what the endpoint actually said, and
 * `reason` so it can tell the kinds of failure apart without reading `status`.
 */
export class TokenRequestError extends Error {
  readonly name = "TokenRequestError"
  readonly reason: TokenRequestReason
  readonly status: number
  readonly body: string
  readonly url: string
  /** What fetch threw, for `reason: "network"` only. */
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

  /** This error as the plain detail a `mapError` hook receives. */
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
