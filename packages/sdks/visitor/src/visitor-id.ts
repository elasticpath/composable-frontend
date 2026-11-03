const VISITOR_ID_FORMAT = /^[0-9a-f]{32}$/

export function isVisitorId(value: string | undefined): value is string {
  return value !== undefined && VISITOR_ID_FORMAT.test(value)
}

export function newVisitorId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  )
}
