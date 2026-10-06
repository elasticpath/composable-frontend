import "server-only"

import { cookies } from "next/headers"
import { ACTIVE_CART_COOKIE_KEY } from "@/app/constants"

const ACTIVE_CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export async function setActiveCartCookie(cartId: string): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set({
    name: ACTIVE_CART_COOKIE_KEY,
    value: cartId,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ACTIVE_CART_COOKIE_MAX_AGE_SECONDS,
  })
}
