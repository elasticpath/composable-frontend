"use client"

import { useState, useEffect } from "react"
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../app/constants"

interface AccountMemberCredentials {
  token: string
  expires: number
  accountId?: string
  email: string
  name: string
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null
  }
  return null
}

function parseAccountMemberCredentials(
  cookieValue: string,
): AccountMemberCredentials | null {
  try {
    return JSON.parse(
      decodeURIComponent(cookieValue),
    ) as AccountMemberCredentials
  } catch (e) {
    return null
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AccountMemberCredentials | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const cookieValue = getCookieValue(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME)

      console.log("cookieValue", cookieValue)

      if (cookieValue) {
        const credentials = parseAccountMemberCredentials(cookieValue)

        if (
          credentials &&
          credentials.expires &&
          credentials.expires * 1000 > Date.now()
        ) {
          setIsAuthenticated(true)
          setUser(credentials)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }

      setIsLoading(false)
    }

    checkAuth()

    // Listen for storage events to detect auth changes
    window.addEventListener("storage", checkAuth)
    // Also listen for custom auth events
    window.addEventListener("auth:changed", checkAuth)

    return () => {
      window.removeEventListener("storage", checkAuth)
      window.removeEventListener("auth:changed", checkAuth)
    }
  }, [])

  return {
    isAuthenticated,
    user,
    isLoading,
  }
}
