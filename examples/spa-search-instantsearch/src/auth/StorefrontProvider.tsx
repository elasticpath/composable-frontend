"use client"

import React, { useCallback, useEffect } from "react"
import {
  AccessTokenResponse,
  client,
  createAnAccessToken,
} from "@epcc-sdk/sdks-shopper"
import { CREDENTIALS_COOKIE_KEY } from "../constants"

function tokenExpired(expires: number): boolean {
  return Math.floor(Date.now() / 1000) >= expires
}

client.setConfig({
  baseUrl: import.meta.env.VITE_APP_EPCC_ENDPOINT_URL!,
})

// Temporary workaround for multi_search endpoint locally
client.interceptors.request.use(async (req) => {
  const originalUrl = new URL(req.url)

  if (originalUrl.pathname.startsWith("/multi_search")) {
    const rewritten = new URL(
      originalUrl.pathname + originalUrl.search,
      "http://localhost:7001",
    )
    const hasBody = req.method !== "GET" && req.method !== "HEAD"

    // If something already touched the stream, rebuild bytes from a clone.
    const body = hasBody ? await req.json() : undefined

    return new Request(rewritten.toString(), {
      method: req.method,
      headers: req.headers,
      body: JSON.stringify(body),
      signal: req.signal,
      credentials: req.credentials,
    })
  }
  return req
})

export function StorefrontProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const interceptor: Parameters<typeof client.interceptors.request.use>[0] =
    useCallback(async (request) => {
      // Bypass interceptor logic for token requests to prevent infinite loop
      if (request.url?.includes("/oauth/access_token")) {
        return request
      }

      let credentials = JSON.parse(
        localStorage.getItem(CREDENTIALS_COOKIE_KEY) ?? "{}",
      ) as AccessTokenResponse | undefined

      // check if token expired or missing
      if (
        !credentials?.access_token ||
        (credentials.expires && tokenExpired(credentials.expires))
      ) {
        const clientId = import.meta.env.VITE_APP_EPCC_CLIENT_ID

        if (!clientId) {
          throw new Error("Missing storefront client id")
        }

        const authResponse = await createAnAccessToken({
          body: {
            grant_type: "implicit",
            client_id: clientId,
          },
        })

        /**
         * Check response did not fail
         */
        if (!authResponse.data) {
          throw new Error("Failed to get access token")
        }

        const token = authResponse.data

        // Store the credentials in localStorage
        localStorage.setItem(CREDENTIALS_COOKIE_KEY, JSON.stringify(token))
        credentials = token
      }

      if (credentials?.access_token) {
        request.headers.set(
          "Authorization",
          `Bearer ${credentials.access_token}`,
        )
      }
      return request
    }, [])

  // Auto-authenticate if not already authenticated
  useEffect(() => {
    // Add request interceptor to include the token in requests
    client.interceptors.request.use(interceptor)

    return () => {
      client.interceptors.request.eject(interceptor)
    }
  }, [])

  return <>{children}</>
}
