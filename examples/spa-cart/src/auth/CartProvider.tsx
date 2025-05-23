"use client"

import React, { useEffect } from "react"
import { initializeCart } from "@epcc-sdk/sdks-shopper"

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize cart if not already initialized
  useEffect(() => {
    initializeCart()
  }, [])

  return <>{children}</>
}
