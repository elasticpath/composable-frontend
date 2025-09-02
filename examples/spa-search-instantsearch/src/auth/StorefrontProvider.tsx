"use client"

import { client, configureClient } from "@epcc-sdk/sdks-shopper"

// Configure the client immediately when the module is loaded
const clientId = import.meta.env.VITE_APP_EPCC_CLIENT_ID!
const baseUrl = import.meta.env.VITE_APP_EPCC_ENDPOINT_URL!

if (!clientId) {
  throw new Error("Missing storefront client id")
}

if (!baseUrl) {
  throw new Error("Missing storefront endpoint URL")
}

// Configure the SDK client with built-in auth
configureClient(
  {
    baseUrl,
  },
  {
    clientId,
    storage: "localStorage", // Use localStorage to persist tokens
  },
)

// Temporary workaround for multi_search endpoint locally
client.interceptors.request.use(async (req) => {
  const originalUrl = new URL(req.url)

  if (originalUrl.pathname.startsWith("/pcm/catalog/multi_search")) {
    const rewritten = new URL(
      originalUrl.pathname + originalUrl.search,
      "http://localhost:8000",
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
  return <>{children}</>
}
