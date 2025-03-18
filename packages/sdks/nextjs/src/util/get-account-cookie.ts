import { getCookieValue } from "./get-cookie-value"

export const DEFAULT_ACCOUNT_MEMBER_TOKEN_COOKIE_NAME =
  "_store_ep_account_member_token"

export async function getAccountCookie(
  key: string = DEFAULT_ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
) {
  let cookieValue: string | undefined

  if (typeof window === "undefined") {
    // Dynamically import next/headers on the server.
    const headersModule = await import("next/headers")
    cookieValue = (await headersModule.cookies()).get(key)?.value
  } else {
    // Client side: read document.cookie.
    cookieValue = getCookieValue(key)
  }

  return cookieValue
}
