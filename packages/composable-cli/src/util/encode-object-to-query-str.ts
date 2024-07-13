export function encodeObjectToQueryString(body: Record<string, any>): string {
  return Object.keys(body)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(body[k])}`)
    .join("&")
}
