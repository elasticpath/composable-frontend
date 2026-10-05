import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  ACCOUNT_TOKEN_COOKIE_KEY,
  ACTIVE_CART_COOKIE_KEY,
} from "@/app/constants"
import { getShopperSession } from "./account-session"
import type { CartsPort } from "./cart-service"
import { createCartsPort } from "./carts-port"
import { getImplicitAccessToken } from "./server-credentials"
import { envRequirementProblems } from "./store-requirements"

export type CartContext = {
  port: CartsPort
  cookieCartId: string | undefined
}

export function loginPathFor(returnUrl: string): string {
  return `/login?returnUrl=${encodeURIComponent(returnUrl)}`
}

export async function requireCartContext(
  returnUrl: string,
): Promise<CartContext> {
  if (envRequirementProblems(process.env).length > 0) {
    redirect("/configuration-error")
  }

  const session = await getShopperSession()
  const cookieStore = await cookies()
  const accountToken = cookieStore.get(ACCOUNT_TOKEN_COOKIE_KEY)?.value

  if (!session || !accountToken) {
    redirect(loginPathFor(returnUrl))
  }

  return {
    port: createCartsPort({
      accountId: session.accountId,
      accountToken,
      implicitToken: getImplicitAccessToken,
    }),
    cookieCartId: cookieStore.get(ACTIVE_CART_COOKIE_KEY)?.value,
  }
}
