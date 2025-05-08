import { cookies } from "next/headers"
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../app/constants"

interface AccountMemberCredentials {
  token: string
  expires: number
  accountId?: string
  email: string
  name: string
}

export function parseAccountMemberCredentials(
  cookieValue: string,
): AccountMemberCredentials | undefined {
  try {
    return JSON.parse(cookieValue) as AccountMemberCredentials
  } catch (e) {
    return undefined
  }
}

export function retrieveAccountMemberCredentials(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): AccountMemberCredentials | undefined {
  const cookie = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME)

  if (!cookie) {
    return undefined
  }

  return parseAccountMemberCredentials(cookie.value)
}

export function isAccountMemberAuthenticated(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): boolean {
  const credentials = retrieveAccountMemberCredentials(cookieStore)
  return !!credentials
}

export function tokenExpired(expires: number): boolean {
  return Math.floor(Date.now() / 1000) >= expires
}
