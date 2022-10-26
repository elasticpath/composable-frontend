export function formUrlEncodeBody(body: Record<string, string>): string {
  return Object.keys(body)
    .map(
      (k) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(
          body[k as keyof typeof body]
        )}`
    )
    .join("&");
}
