const PARSE_BASE = "http://return-url.invalid"
const FALLBACK = "/saved-list"

export function safeReturnPath(returnUrl: string | undefined): string {
  if (!returnUrl?.startsWith("/")) return FALLBACK

  let parsed: URL
  try {
    parsed = new URL(returnUrl, PARSE_BASE)
  } catch {
    return FALLBACK
  }

  if (parsed.origin !== PARSE_BASE) return FALLBACK

  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`

  if (path.startsWith("//") || path.startsWith("/\\")) return FALLBACK

  return path
}
