import throttledQueue from "throttled-queue"
import type { ThrottleConfig } from "../types"
import { DEFAULT_THROTTLE_CONFIG } from "../types"

/**
 * Cached throttle queue instance.
 * Using a module-level cache matches the old SDK's behavior.
 */
let globalThrottleQueue:
  | (<T>(fn: () => Promise<T>) => Promise<T>)
  | undefined

/**
 * Create a throttled fetch function.
 *
 * This matches the old SDK's throttle implementation from:
 * ep-js-sdk/src/utils/throttle.js
 *
 * The throttle queue limits requests to `limit` requests per `interval` milliseconds.
 * Requests beyond the limit are queued and executed when a slot becomes available.
 *
 * **Important:** This function uses a global throttle queue. The queue is created with
 * the first configuration passed to this function, and subsequent calls with different
 * configurations will reuse the same queue with the original configuration. If you need
 * separate throttle queues with different configurations, use `createIsolatedThrottledFetch`
 * instead.
 */
export function createThrottledFetch(
  baseFetch: typeof fetch,
  config: Partial<ThrottleConfig> = {}
): typeof fetch {
  const fullConfig: ThrottleConfig = { ...DEFAULT_THROTTLE_CONFIG, ...config }

  // If throttling is disabled, return the base fetch
  if (!fullConfig.enabled) {
    return baseFetch
  }

  // Initialize the throttle queue if not already done
  if (globalThrottleQueue === undefined) {
    globalThrottleQueue = throttledQueue(fullConfig.limit, fullConfig.interval)
  }

  return async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    // Queue the fetch request
    return globalThrottleQueue!(() => baseFetch(input, init))
  }
}

/**
 * Create a throttled fetch with a dedicated queue (not shared globally).
 * Use this when you need separate throttle queues for different clients.
 */
export function createIsolatedThrottledFetch(
  baseFetch: typeof fetch,
  config: Partial<ThrottleConfig> = {}
): typeof fetch {
  const fullConfig: ThrottleConfig = { ...DEFAULT_THROTTLE_CONFIG, ...config }

  // If throttling is disabled, return the base fetch
  if (!fullConfig.enabled) {
    return baseFetch
  }

  // Create a dedicated throttle queue for this instance
  const queue = throttledQueue(fullConfig.limit, fullConfig.interval)

  return async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    return queue(() => baseFetch(input, init))
  }
}

/**
 * Reset the global throttle queue.
 * Useful for testing or when configuration changes.
 */
export function resetGlobalThrottleQueue(): void {
  globalThrottleQueue = undefined
}
