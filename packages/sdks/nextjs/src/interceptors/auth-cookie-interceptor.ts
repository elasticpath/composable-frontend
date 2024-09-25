import type { Client } from "@hey-api/client-fetch"
import { cookies } from "next/headers"
import { CREDENTIALS_COOKIE_NAME } from "../constants/crendentials"

export type RequestMiddleware = Parameters<
  Client["interceptors"]["request"]["use"]
>[0]

export type ResponseMiddleware = Parameters<
  Client["interceptors"]["response"]["use"]
>[0]

export function createAuthCookieInterceptor(creatOptions?: {
  cookieKey?: string
}): RequestMiddleware {
  return function authCookieInterceptor(request, options) {
    const authCookie = cookies().get(
      creatOptions?.cookieKey ?? CREDENTIALS_COOKIE_NAME,
    )

    let bearerToken = null
    if (authCookie?.value) {
      bearerToken = `Bearer ${JSON.parse(authCookie.value).access_token}`
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

export const defaultNextMiddleware: MiddlewareStack = [
  {
    type: "request",
    middleware: createAuthCookieInterceptor(),
  },
]

export function applyDefaultNextMiddleware(client: Client): void {
  for (const middlewareEntry of defaultNextMiddleware) {
    if (middlewareEntry.type === "request") {
      client.interceptors.request.use(middlewareEntry.middleware)
    } else {
      client.interceptors.response.use(middlewareEntry.middleware)
    }
  }
}
