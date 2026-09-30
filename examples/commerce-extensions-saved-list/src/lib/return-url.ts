const ORIGIN = "http://return-url.invalid"

export function safeReturnPath(
  returnUrl: string | undefined,
  fallback = "/saved-list",
): string {
  if (!returnUrl?.startsWith("/")) return fallback

  let parsed: URL
  try {
    parsed = new URL(returnUrl, ORIGIN)
  } catch {
    return fallback
  }

  if (parsed.origin !== ORIGIN) return fallback

  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}
