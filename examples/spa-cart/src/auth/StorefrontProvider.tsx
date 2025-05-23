"use client"

import React, { useEffect } from "react"
import {
  client,
  createAuthLocalStorageInterceptor,
} from "@epcc-sdk/sdks-shopper"

client.setConfig({
  baseUrl: import.meta.env.VITE_APP_EPCC_ENDPOINT_URL!,
})

export function StorefrontProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!import.meta.env.VITE_APP_EPCC_CLIENT_ID) {
      throw new Error("Missing storefront client id")
    }

    const interceptor = createAuthLocalStorageInterceptor({
      clientId: import.meta.env.VITE_APP_EPCC_CLIENT_ID,
    })

    // Add request interceptor to include the token in requests
    client.interceptors.request.use(interceptor)

    return () => {
      client.interceptors.request.eject(interceptor)
    }
  }, [])

  return <>{children}</>
}
