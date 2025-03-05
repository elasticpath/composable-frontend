import type { Client } from "@hey-api/client-fetch"
import { CREDENTIALS_COOKIE_NAME } from "../constants/crendentials"
import { getCookieValue } from "../util/get-cookie-value"

export type RequestMiddleware = Parameters<
  Client["interceptors"]["request"]["use"]
>[0]

export type ResponseMiddleware = Parameters<
  Client["interceptors"]["response"]["use"]
>[0]

export function createAuthCookieInterceptor(creatOptions?: {
  cookieKey?: string
}): RequestMiddleware {
  return async function authCookieInterceptor(request, options) {
    const cookieKey = creatOptions?.cookieKey ?? CREDENTIALS_COOKIE_NAME

    let cookieValue: string | undefined

    if (typeof window === "undefined") {
      // Dynamically import next/headers on the server.
      const headersModule = await import("next/headers")
      cookieValue = headersModule.cookies().get(cookieKey)?.value
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

    if (bearerToken) {
      request.headers.set("Authorization", bearerToken)
    } else {
      console.warn(
        "Elastic Path Next.js authentication cookie interceptor: Did not set Authorization header on request, no access token found in cookie, please check the cookie name.",
      )
    }

    return request
  }
}

export type MiddlewareStack = Array<
  | {
      type: "request"
      middleware: RequestMiddleware
    }
  | {
      type: "response"
      middleware: ResponseMiddleware
    }
>

export type CreateDefaultNextMiddlewareStackOptions = { cookieKey?: string }

export function createDefaultNextMiddlewareStack(
  options?: CreateDefaultNextMiddlewareStackOptions,
): MiddlewareStack {
  return [
    {
      type: "request",
      middleware: createAuthCookieInterceptor({
        cookieKey: options?.cookieKey,
      }),
    },
  ]
}

export function applyDefaultNextMiddleware(
  client: Client,
  options?: CreateDefaultNextMiddlewareStackOptions,
): void {
  const defaultNextMiddleware = createDefaultNextMiddlewareStack(options)
  for (const middlewareEntry of defaultNextMiddleware) {
    if (middlewareEntry.type === "request") {
      client.interceptors.request.use(middlewareEntry.middleware)
    } else {
      client.interceptors.response.use(middlewareEntry.middleware)
    }
  }
}
