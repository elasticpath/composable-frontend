import { resolveVisitor } from "@epcc-sdk/sdks-shopper";
import type { Visitor } from "@epcc-sdk/sdks-shopper";
import { consent } from "./consent";

function requestFromCookiesAndHeaders(
  cookies: { name: string; value: string }[],
  headers: Headers,
): Request {
  const requestHeaders = new Headers(headers);
  requestHeaders.set(
    "cookie",
    cookies.map(({ name, value }) => `${name}=${value}`).join("; "),
  );
  return new Request("https://visitor.invalid/", { headers: requestHeaders });
}

export async function resolveServerVisitor(
  cookies: { name: string; value: string }[],
  headers: Headers,
): Promise<Visitor> {
  const { visitor } = await resolveVisitor(
    requestFromCookiesAndHeaders(cookies, headers),
    { consent },
  );
  return visitor;
}

export async function readServerVisitor(): Promise<Visitor> {
  const { cookies, headers } = await import("next/headers");
  return resolveServerVisitor(
    (await cookies()).getAll(),
    new Headers(await headers()),
  );
}
