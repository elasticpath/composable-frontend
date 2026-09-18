import type { TokenSource } from "./types"

/**
 * The value a generated client's `Config.auth` expects: called once per
 * request, returns the bare token. The client adds the `Bearer ` prefix itself
 * when the operation's security scheme says so, and its `setAuthParams` skips
 * the call entirely when the header is already present.
 */
export function createAuthCallback(source: TokenSource): () => Promise<string> {
  return () => source.getToken()
}

export interface RetryFetchOptions {
  /** Replacement for the global fetch. */
  fetch?: typeof fetch
  /**
   * Requests that must never carry a token. Defaults to any URL containing
   * `/oauth/`, which stops a 401 from the token endpoint asking for a token.
   */
  isAuthRequest?: (url: string) => boolean
}

const defaultIsAuthRequest = (url: string): boolean => url.includes("/oauth/")

function withBearer(request: Request, token: string): Request {
  const headers = new Headers(request.headers)
  headers.set("Authorization", `Bearer ${token}`)
  return new Request(request, { headers })
}

/**
 * Wraps fetch so every request carries a token and a 401 is retried once with a
 * fresh one.
 *
 * Constructing a `Request` from a `Request` consumes the original's body, so
 * the retry copy is cloned before the first send. Without that, the retry
 * throws for any request with a body and only GETs ever recover from a 401.
 *
 * A second 401 is returned to the caller, not thrown, and so is the original
 * 401 if the refresh itself fails. This stays a well-behaved `fetch`.
 *
 * An `Authorization` header the caller set is never replaced, and such a request
 * is not retried either. A header carrying this source's own token is the
 * client's `auth` hook having run first, and is refreshed on a 401 as usual.
 */
export function createRetryFetch(
  source: TokenSource,
  options: RetryFetchOptions = {},
): typeof fetch {
  const baseFetch = options.fetch ?? globalThis.fetch
  const isAuthRequest = options.isAuthRequest ?? defaultIsAuthRequest

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request =
      input instanceof Request && init === undefined ? input : new Request(input, init)

    // Never attach a token to the token endpoint.
    if (isAuthRequest(request.url)) {
      return baseFetch(request)
    }

    // Before the first send: the body reads once.
    const retryable = request.clone()

    const existing = request.headers.get("Authorization")
    const cached = source.peek()
    const isOwnHeader = cached !== undefined && existing === `Bearer ${cached}`

    // A header this source did not produce is the caller's own credential. We
    // neither replace it nor retry it, because we have nothing better to put in
    // its place. A header holding this source's own token is the generated
    // client's `auth` hook having run first, and that one we may refresh.
    if (existing !== null && !isOwnHeader) {
      return baseFetch(request)
    }

    const response = isOwnHeader
      ? await baseFetch(request)
      : await baseFetch(withBearer(request, await source.getToken()))

    if (response.status !== 401) {
      return response
    }

    let refreshed: string
    try {
      refreshed = await source.getToken({ forceRefresh: true })
    } catch {
      source.clear()
      return response
    }

    return baseFetch(withBearer(retryable, refreshed))
  }
}
