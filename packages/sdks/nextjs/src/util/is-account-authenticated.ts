import { getAccountCookie } from "./get-account-cookie"

export async function isAccountAuthenticated() {
  const cookieValue = await getAccountCookie()
  return !!cookieValue
}
