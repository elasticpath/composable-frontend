import type { TokenSource } from "./types"

/** The generated client adds the `Bearer ` prefix itself, so this returns the bare token. */
export function createAuthCallback(source: TokenSource): () => Promise<string> {
  return () => source.getToken()
}

export interface AuthenticatedFetchOptions {
  fetch?: typeof fetch
  isAuthRequest?: (url: string) => boolean
}

const defaultIsAuthRequest = (url: string): boolean => url.includes("/oauth/")

const BEARER = /^Bearer\s+(.+)$/i

/** The token inside an `Authorization` header, or undefined for any other scheme. */
function bearerToken(header: string | null): string | undefined {
  if (header === null) return undefined
  return BEARER.exec(header)?.[1]
}

function withBearer(request: Request, token: string): Request {
  const headers = new Headers(request.headers)
  headers.set("Authorization", `Bearer ${token}`)
  return new Request(request, { headers })
}

export function createAuthenticatedFetch(
  source: TokenSource,
  options: AuthenticatedFetchOptions = {},
): typeof fetch {
  const baseFetch = options.fetch ?? globalThis.fetch
  const isAuthRequest = options.isAuthRequest ?? defaultIsAuthRequest

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request =
      input instanceof Request && init === undefined ? input : new Request(input, init)

    // Loop guard: a token on the token endpoint makes its 401 ask for a token.
    if (isAuthRequest(request.url)) {
      return baseFetch(request)
    }

    // A body reads once, so the retry copy must be taken before the first send.
    const retryable = request.clone()

    const existing = request.headers.get("Authorization")
    const presented = bearerToken(existing)
    // Ownership is asked of every token the source issued recently, never of
    // the single token it holds right now. The source can rotate between the
    // `auth` hook stamping this header and the request being sent, and during
    // a forced refresh it holds nothing at all. Either way the header is still
    // ours, and deciding otherwise silently turns the 401 retry off.
    const isOwnHeader = presented !== undefined && source.owns(presented)

    // Passing through every header already present would leave the retry dead:
    // the client's `auth` hook sets one on every request. A header holding this
    // source's own token is that hook's, and ours to refresh; anything else is a
    // credential we have nothing better to put in place of.
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
