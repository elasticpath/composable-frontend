import { CREDENTIALS_COOKIE_NAME } from "../constants/crendentials"
import { getCookieValue } from "../util/get-cookie-value"
import { RequestMiddleware } from "./stack"

export function createAuthCookieInterceptor(creatOptions?: {
  cookieKey?: string
}): RequestMiddleware {
  return async function authCookieInterceptor(request, _options) {
    const cookieKey = creatOptions?.cookieKey ?? CREDENTIALS_COOKIE_NAME

    let cookieValue: string | undefined

    if (typeof window === "undefined") {
      // Dynamically import next/headers on the server.
      const headersModule = await import("next/headers")
      cookieValue = (await headersModule.cookies()).get(cookieKey)?.value
    } else {
      // Client side: read document.cookie.
      cookieValue = getCookieValue(cookieKey)
    }

    let bearerToken: string | null = null
    if (cookieValue) {
      try {
        const parsed = JSON.parse(cookieValue)
        if (parsed?.access_token) {
          bearerToken = `Bearer ${parsed.access_token}`
        }
      } catch (err) {
        console.error(
          "Elastic Path Next.js authentication cookie interceptor: Failed to parse auth cookie",
          err,
        )
      }
    }

    if (bearerToken && !request.headers.has("Authorization")) {
      request.headers.set("Authorization", bearerToken)
    } else {
      console.warn(
        "Elastic Path Next.js authentication cookie interceptor: Did not set Authorization header on request, no access token found in cookie, please check the cookie name.",
      )
    }

    return request
  }
}
