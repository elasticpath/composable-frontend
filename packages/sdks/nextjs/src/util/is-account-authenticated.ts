import { getAccountCookie } from "./get-account-cookie"

export async function isAccountAuthenticated(cookieKey?: string) {
  const cookieValue = await getAccountCookie(cookieKey)
  return !!cookieValue
}
