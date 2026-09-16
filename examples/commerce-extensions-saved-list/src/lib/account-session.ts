import "server-only"

import { cookies } from "next/headers"
import { SESSION_COOKIE_KEY } from "../app/constants"
import { readSessionCookieValue, type ShopperSession } from "./session"

export async function getShopperSession(): Promise<ShopperSession | null> {
  const cookieStore = await cookies()

  return readSessionCookieValue(
    cookieStore.get(SESSION_COOKIE_KEY)?.value,
    process.env.SESSION_SECRET ?? "",
  )
}
