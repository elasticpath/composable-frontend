const PARSE_BASE = "http://return-url.invalid"

export function safeReturnPath(
  returnUrl: string | null | undefined,
  fallback: string,
): string {
  if (!returnUrl?.startsWith("/")) return fallback

  let parsed: URL
  try {
    parsed = new URL(returnUrl, PARSE_BASE)
  } catch {
    return fallback
  }

  if (parsed.origin !== PARSE_BASE) return fallback

  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`

  if (path.startsWith("//") || path.startsWith("/\\")) return fallback

  return path
}
