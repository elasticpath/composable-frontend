/**
 * A token endpoint returned something unusable. Carries the HTTP status and the
 * raw response body so the caller can see what the endpoint actually said.
 */
export class TokenRequestError extends Error {
  readonly name = "TokenRequestError"
  readonly status: number
  readonly body: string
  readonly url: string

  constructor(message: string, init: { status: number; body: string; url: string }) {
    super(message)
    this.status = init.status
    this.body = init.body
    this.url = init.url
    Object.setPrototypeOf(this, TokenRequestError.prototype)
  }
}
