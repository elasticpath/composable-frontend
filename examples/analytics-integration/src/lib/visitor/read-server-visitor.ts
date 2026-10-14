import { resolveVisitor } from "@epcc-sdk/visitor";
import type { Visitor } from "@epcc-sdk/visitor";
import { consent } from "./consent";

export async function resolveServerVisitor(
  cookies: { name: string; value: string }[],
  headers: Headers,
): Promise<Visitor> {
  const requestHeaders = new Headers(headers);
  requestHeaders.set(
    "cookie",
    cookies.map(({ name, value }) => `${name}=${value}`).join("; "),
  );

  const { visitor } = await resolveVisitor(
    new Request("https://visitor.invalid/", { headers: requestHeaders }),
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
