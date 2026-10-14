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

export function sessionCookie(name: string, value: string): string {
  return `${name}=${value}; Path=/; Secure; SameSite=Lax; HttpOnly`
}

export function clearedCookie(
  name: string,
  attributes: { httpOnly: boolean },
): string {
  const httpOnly = attributes.httpOnly ? "; HttpOnly" : ""
  return `${name}=; Path=/; Max-Age=0; Secure; SameSite=Lax${httpOnly}`
}
