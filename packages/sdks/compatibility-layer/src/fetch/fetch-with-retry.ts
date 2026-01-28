import type { RetryConfig, SharedAuthStateInterface } from "../types"
import { DEFAULT_RETRY_CONFIG } from "../types"

/**
 * Calculate delay for retry attempt using exponential backoff with jitter.
 * Formula: attempt * baseDelay + random(0, jitter)
 *
 * This matches the old SDK's retry delay calculation from:
 * ep-js-sdk/src/factories/request.js line 86
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  return attempt * config.baseDelay + Math.floor(Math.random() * config.jitter)
}

/**
 * Sleep for the specified duration.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if the URL is an OAuth endpoint (to skip auth injection).
 */
function isOAuthEndpoint(url: string): boolean {
  return url.includes("/oauth/")
}

/**
 * Fetch with retry logic ported from old SDK.
 *
 * Implements:
 * - Exponential backoff with jitter on retries
 * - 401 handling: re-authenticate and retry
 * - 429 handling: retry with backoff (rate limiting)
 * - Configurable max attempts
 *
 * Based on ep-js-sdk/src/factories/request.js lines 54-118
 */
export async function fetchWithRetry(
  request: Request,
  config: Partial<RetryConfig>,
  authState: SharedAuthStateInterface | undefined,
  baseFetch: typeof fetch,
  attempt = 1
): Promise<Response> {
  const fullConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config }

  // Clone request for potential retry (body can only be read once)
  const requestClone = request.clone()

  // Skip auth injection for OAuth endpoints to prevent infinite loops
  const skipAuth = isOAuthEndpoint(request.url)

  // Add auth token if not an OAuth request and we have auth state
  if (!skipAuth && authState) {
    try {
      const token = await authState.getValidAccessToken()
      if (token && !request.headers.has("Authorization")) {
        request.headers.set("Authorization", `Bearer ${token}`)
      }
    } catch {
      // If token fetch fails, continue without auth
      // The request will likely fail with 401 which triggers reauth
    }
  }

  let response: Response
  try {
    response = await baseFetch(request)
  } catch (error) {
    // Network error - don't retry on network failures
    throw error
  }

  // Success - return response
  if (response.ok) {
    return response
  }

  // Check if we've exhausted retries
  if (attempt >= fullConfig.maxAttempts) {
    return response
  }

  // Handle 401 - re-authenticate and retry
  if (response.status === 401 && fullConfig.reauth && !skipAuth && authState) {
    try {
      // Force token refresh
      await authState.refresh()

      // Calculate delay and wait
      const retryDelay = calculateDelay(attempt, fullConfig)
      await sleep(retryDelay)

      // Retry with new token
      return fetchWithRetry(
        requestClone,
        fullConfig,
        authState,
        baseFetch,
        attempt + 1
      )
    } catch {
      // Auth refresh failed, return original 401 response
      return response
    }
  }

  // Handle 429 - rate limited, retry with backoff
  if (response.status === 429) {
    const retryDelay = calculateDelay(attempt, fullConfig)
    await sleep(retryDelay)

    // Retry without re-auth (just rate limited)
    return fetchWithRetry(
      requestClone,
      fullConfig,
      authState,
      baseFetch,
      attempt + 1
    )
  }

  // Other errors - don't retry
  return response
}

/**
 * Create a fetch function with retry logic.
 * This can be injected into @hey-api/client-fetch via client.setConfig({ fetch: ... })
 */
export function createFetchWithRetry(
  config: Partial<RetryConfig>,
  authState: SharedAuthStateInterface | undefined,
  baseFetch: typeof fetch = globalThis.fetch
): typeof fetch {
  return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init)
    return fetchWithRetry(request, config, authState, baseFetch)
  }
}
