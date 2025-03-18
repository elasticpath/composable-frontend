import { Client } from "@hey-api/client-fetch"
import { createAuthCookieInterceptor } from "./auth-cookie-interceptor"
import { createAccountCookieInterceptor } from "./account-cookie-interceptor"

export type RequestMiddleware = Parameters<
  Client["interceptors"]["request"]["use"]
>[0]

export type ResponseMiddleware = Parameters<
  Client["interceptors"]["response"]["use"]
>[0]

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

export type CreateDefaultNextMiddlewareStackOptions = {
  cookieKey?: string
  accountCookieKey?: string
}

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
    {
      type: "request",
      middleware: createAccountCookieInterceptor({
        cookieKey: options?.accountCookieKey,
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
