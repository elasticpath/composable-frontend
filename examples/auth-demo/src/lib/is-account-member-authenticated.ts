import { cookies } from "next/headers"
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "./constants"
import { retrieveAccountMemberCredentials } from "./retrieve-account-member-credentials"

export function isAccountMemberAuthenticated(): boolean {
  const cookieStore = cookies()
  const credentials = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  )

  return credentials !== null
}
