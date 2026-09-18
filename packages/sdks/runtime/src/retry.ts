/** RFC 9110 §9.2.2: "PUT, DELETE, and safe request methods are idempotent." */
export const IDEMPOTENT_METHODS: ReadonlySet<string> = new Set([
  "GET",
  "HEAD",
  "PUT",
  "DELETE",
  "OPTIONS",
  "TRACE",
])

/** The origin said it did not process the request, so a replay is safe on any method. */
export const NOT_PROCESSED_STATUS: ReadonlySet<number> = new Set([408, 429])

/** 501 is absent on purpose: "Not Implemented" is permanent, not transient. */
export const AMBIGUOUS_STATUS: ReadonlySet<number> = new Set([500, 502, 503, 504])

/**
 * Failures that prove no connection was established, so the request cannot have
 * been applied — RFC 9110 §9.2.2's "some means to detect that the original
 * request was never applied". Everything absent here (ECONNRESET, EPIPE, a
 * timeout) is ambiguous: the bytes may have landed and only the response lost.
 */
export const NEVER_DELIVERED_CODES: ReadonlySet<string> = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ENETUNREACH",
  "EHOSTUNREACH",
])

export type JitterStrategy = "none" | "equal" | "full"
export type BackoffStrategy = "exponential" | "decorrelated"

export interface RetryStatusContext {
  status: number
  method: string
  isIdempotent: boolean
}

export interface RetryErrorContext {
  error: unknown
  code: string | null
  neverDelivered: boolean
  method: string
  isIdempotent: boolean
}

export type RetryEvent =
  | { type: "send"; attempt: number; method: string; url: string; elapsedMs: number }
  | { type: "outcome"; attempt: number; status?: number; code?: string | null; wantRetry: boolean }
  | { type: "wait"; attempt: number; delayMs: number; delaySource: string }
  | { type: "give-up"; reason: "max-attempts" | "deadline"; attempt: number; elapsedMs: number }

export interface RetryFetchOptions {
  /** The transport every attempt goes through. Put the auth wrapper here. */
  fetch?: typeof fetch
  maxAttempts?: number
  baseDelayMs?: number
  maxDelayMs?: number
  jitter?: JitterStrategy
  /** Wall-clock budget for the whole schedule, measured from the first send. */
  deadlineMs?: number
  backoff?: BackoffStrategy
  respectRetryAfter?: boolean
  /** A server may name a wait longer than we will hold the call open for. */
  maxRetryAfterMs?: number
  shouldRetryStatus?: (ctx: RetryStatusContext) => boolean
  shouldRetryError?: (ctx: RetryErrorContext) => boolean
  now?: () => number
  /** Given the request's signal, so an abort mid-wait ends the wait. */
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>
  rng?: () => number
  onEvent?: (event: RetryEvent) => void
}

/** Node's fetch wraps every transport failure in a TypeError and hides the code on `cause`. */
export function transportErrorCode(error: unknown): string | null {
  let current = error as { code?: unknown; cause?: unknown } | undefined | null
  for (let depth = 0; depth < 5 && current; depth += 1) {
    if (typeof current.code === "string") return current.code
    current = current.cause as typeof current
  }
  return null
}

export function isNeverDelivered(error: unknown): boolean {
  const code = transportErrorCode(error)
  return code !== null && NEVER_DELIVERED_CODES.has(code)
}

/**
 * The caller's own cancellation, in both shapes a runtime produces it:
 * `AbortError` from `AbortController.abort()` and `TimeoutError` from
 * `AbortSignal.timeout()`. Neither is a transport failure. Nobody is waiting
 * for the answer any more, so sending the request again spends the whole
 * schedule on nothing and delays the abort the caller asked for.
 */
export function isAbortError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  const name = (error as { name?: unknown }).name
  return name === "AbortError" || name === "TimeoutError"
}

/** `DOMException` is not everywhere; a named Error reads the same to a caller. */
function abortReason(signal: AbortSignal): unknown {
  const reason = (signal as { reason?: unknown }).reason
  if (reason !== undefined) return reason
  const error = new Error("This operation was aborted")
  error.name = "AbortError"
  return error
}

const defaultSleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortReason(signal))
      return
    }
    const onAbort = () => {
      clearTimeout(timer)
      reject(abortReason(signal as AbortSignal))
    }
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, ms)
    signal?.addEventListener("abort", onAbort, { once: true })
  })

/**
 * RFC 9110 §10.2.3 gives two forms, delay-seconds and HTTP-date. Returns null
 * when absent or unparseable so the caller falls back to the computed curve,
 * and never a negative wait: a date in the past means "now".
 */
export function parseRetryAfter(
  value: string | null | undefined,
  nowMs: number,
): number | null {
  if (value === null || value === undefined) return null
  const raw = String(value).trim()
  if (raw === "") return null

  // The ABNF for delay-seconds is 1*DIGIT, and every HTTP-date form starts with
  // a day-name. Requiring that letter stops `Date.parse` reading "-5" as a year.
  if (/^\d+$/.test(raw)) return Number(raw) * 1000
  if (!/^[A-Za-z]/.test(raw)) return null

  const at = Date.parse(raw)
  if (Number.isNaN(at)) return null
  return Math.max(0, at - nowMs)
}

/** `attempt` is 1-based and names the attempt that just failed, so the first wait targets `base`. */
export function computeDelay(input: {
  strategy: BackoffStrategy
  jitter: JitterStrategy
  attempt: number
  baseDelayMs: number
  maxDelayMs: number
  previousDelayMs: number
  rng: () => number
}): number {
  const { strategy, jitter, attempt, baseDelayMs, maxDelayMs, previousDelayMs, rng } = input

  if (strategy === "decorrelated") {
    const high = (previousDelayMs || baseDelayMs) * 3
    return Math.min(maxDelayMs, baseDelayMs + rng() * (high - baseDelayMs))
  }

  const target = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1))
  switch (jitter) {
    case "none":
      return target
    case "equal":
      return target / 2 + rng() * (target / 2)
    case "full":
    default:
      return rng() * target
  }
}

/**
 * The shipped policy. 401 is deliberately absent: it belongs to the auth
 * wrapper alone, and listing it here makes the two layers fight over the same
 * failure. 403 and every other 4xx are permanent answers.
 */
const defaultShouldRetryStatus = ({ status, isIdempotent }: RetryStatusContext): boolean => {
  if (NOT_PROCESSED_STATUS.has(status)) return true
  if (AMBIGUOUS_STATUS.has(status)) return isIdempotent
  return false
}

const defaultShouldRetryError = ({
  neverDelivered,
  isIdempotent,
}: RetryErrorContext): boolean => neverDelivered || isIdempotent

/**
 * A `fetch`-shaped retry wrapper. This is the backoff schedule.
 * `createAuthenticatedFetch` is the other one: it refreshes a token and replays
 * a 401, and nothing else. The two appear on adjacent lines of one
 * `createConfig` call, so their names are kept far apart on purpose.
 */
export function createRetryFetch(options: RetryFetchOptions = {}): typeof fetch {
  const {
    fetch: baseFetch = globalThis.fetch,
    maxAttempts = 3,
    baseDelayMs = 500,
    maxDelayMs = 20_000,
    jitter = "full",
    deadlineMs = 30_000,
    backoff = "exponential",
    respectRetryAfter = true,
    maxRetryAfterMs = 60_000,
    shouldRetryStatus = defaultShouldRetryStatus,
    shouldRetryError = defaultShouldRetryError,
    now = () => Date.now(),
    sleep = defaultSleep,
    rng = Math.random,
    onEvent = () => {},
  } = options

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const template =
      input instanceof Request && init === undefined ? input : new Request(input, init)

    const method = template.method.toUpperCase()
    const isIdempotent = IDEMPOTENT_METHODS.has(method)
    const signal: AbortSignal | undefined = template.signal ?? undefined
    const startedAt = now()

    let previousDelayMs = 0

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      // A body reads once, so every send is a clone of a template that is never
      // itself consumed. Rebuilding the request instead re-serializes a
      // multipart body under a new boundary while the old Content-Type survives.
      const attemptRequest = template.clone()

      onEvent({
        type: "send",
        attempt,
        method,
        url: attemptRequest.url,
        elapsedMs: now() - startedAt,
      })

      let response: Response | null = null
      let error: unknown = null
      try {
        response = await baseFetch(attemptRequest)
      } catch (caught) {
        // An abort is the caller withdrawing the request, not a failure to
        // deliver it. Rethrown here so the abort surfaces now rather than after
        // two more attempts and the waits between them.
        if (signal?.aborted === true || isAbortError(caught)) throw caught
        error = caught
      }

      let wantRetry: boolean
      if (response === null) {
        const code = transportErrorCode(error)
        wantRetry = shouldRetryError({
          error,
          code,
          neverDelivered: isNeverDelivered(error),
          method,
          isIdempotent,
        })
        onEvent({ type: "outcome", attempt, code, wantRetry })
      } else {
        wantRetry = shouldRetryStatus({ status: response.status, method, isIdempotent })
        onEvent({ type: "outcome", attempt, status: response.status, wantRetry })
      }

      if (!wantRetry || attempt === maxAttempts) {
        if (wantRetry) {
          onEvent({
            type: "give-up",
            reason: "max-attempts",
            attempt,
            elapsedMs: now() - startedAt,
          })
        }
        if (response === null) throw error
        return response
      }

      const fromHeader = respectRetryAfter
        ? parseRetryAfter(response?.headers.get("Retry-After"), now())
        : null

      let delayMs: number
      let delaySource: string
      if (fromHeader !== null) {
        delayMs = Math.min(fromHeader, maxRetryAfterMs)
        delaySource = fromHeader > maxRetryAfterMs ? "retry-after (clamped)" : "retry-after"
      } else {
        delayMs = computeDelay({
          strategy: backoff,
          jitter,
          attempt,
          baseDelayMs,
          maxDelayMs,
          previousDelayMs,
          rng,
        })
        delaySource = `${backoff}/${jitter}`
      }
      delayMs = Math.round(delayMs)
      previousDelayMs = delayMs

      const elapsedMs = now() - startedAt
      // Giving up is more honest than clamping a wait the server asked for down
      // to something it did not, and then retrying before it is ready.
      if (elapsedMs + delayMs > deadlineMs) {
        onEvent({ type: "give-up", reason: "deadline", attempt, elapsedMs })
        if (response === null) throw error
        return response
      }

      onEvent({ type: "wait", attempt, delayMs, delaySource })

      if (response !== null) {
        try {
          await response.body?.cancel()
        } catch {
          // Already closed. An abandoned body left unread leaks a socket.
        }
      }

      await sleep(delayMs, signal)
      // A caller-supplied `sleep` need not watch the signal, so the wait is
      // checked afterwards too. Either way the abort ends the schedule.
      if (signal?.aborted === true) throw abortReason(signal)
    }

    /* c8 ignore next */
    throw new Error("unreachable: the attempt loop always returns or throws")
  }
}
