/**
 * Helper to craft a JWT with exp in seconds from now
 */
export const makeJwtExpIn = (sec: number) => {
  const header = { alg: "none", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const payload = { exp: now + sec }
  const b64 = (o: any) =>
    btoa(JSON.stringify(o))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
  return `${b64(header)}.${b64(payload)}.`
}

/**
 * Type assertion helper for mocks
 */
export const asAny = (fn: any): any => fn
