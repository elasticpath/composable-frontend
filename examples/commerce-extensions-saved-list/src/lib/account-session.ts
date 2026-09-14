import "server-only"

import { cookies } from "next/headers"
import { SESSION_COOKIE_KEY } from "../app/constants"
import { readSessionCookieValue, type ShopperSession } from "./session"

/**
 * The one place server code learns who is asking.
 *
 * Route handlers and server components call this and nothing else. No route
 * reads an account id out of a request body, a query string, or an unsigned
 * cookie, because there is no function here that would give them one.
 */
export async function getShopperSession(): Promise<ShopperSession | null> {
  const cookieStore = await cookies()

  return readSessionCookieValue(
    cookieStore.get(SESSION_COOKIE_KEY)?.value,
    process.env.SESSION_SECRET ?? "",
  )
}
