export function resolveOrigin(h: Headers) {
  let origin = h.get("origin");
  if (!origin) {
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("x-forwarded-host") ?? h.get("host"); // dev or non-proxied
    if (host) {
      origin = `${proto}://${host}`;
    }
  }
  if (!origin) {
    const ref = h.get("referer") ?? h.get("referrer");
    if (ref) origin = new URL(ref).origin;
  }

  if (!origin) {
    console.warn("Unable to resolve origin fallback to env or localhost");
    origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  }

  return origin;
}
