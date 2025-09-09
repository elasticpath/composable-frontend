"use client"

import { configureClient } from "@epcc-sdk/sdks-shopper"

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

export function StorefrontProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
