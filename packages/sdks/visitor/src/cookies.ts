export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie")
  if (!header) return undefined

  for (const pair of header.split(";")) {
    const separator = pair.indexOf("=")
    if (separator === -1) continue
    if (pair.slice(0, separator).trim() === name) {
      return pair.slice(separator + 1).trim()
    }
  }
  return undefined
}

export function lastingCookie(
  name: string,
  value: string,
  lifetimeSeconds: number,
): string {
  return `${name}=${value}; Path=/; Max-Age=${lifetimeSeconds}; Secure; SameSite=Lax`
}
