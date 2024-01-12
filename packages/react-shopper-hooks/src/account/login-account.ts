import { AccountMember, AccountTokenBase, Moltin, Resource } from "@moltin/sdk"
import Cookies from "js-cookie"
import jwtDecode from "jwt-decode"

export type CookieTokenStore = {
  __type: "cookie"
  name: string
  getToken(): string | undefined
  setToken(token: string): void
  deleteToken(): void
}

export type TokenStore = CookieTokenStore

export function createCookieTokenStore(
  name: string = "_store_ep_account_member_token",
): TokenStore {
  return {
    __type: "cookie",
    name,
    getToken() {
      return Cookies.get(name)
    },
    setToken(token: string) {
      Cookies.set(name, token)
    },
    deleteToken() {
      Cookies.remove(name)
    },
  }
}

export async function loginUsernamePassword(
  client: Moltin,
  details: {
    passwordProfileId: string
    email: string
    password: string
  },
) {
  return client.AccountMembers.GenerateAccountToken({
    type: "account_management_authentication_token",
    authentication_mechanism: "password",
    password_profile_id: details.passwordProfileId,
    username: details.email.toLowerCase(), // Known bug for uppercase usernames so we force lowercase.
    password: details.password,
  })
}

export async function resolveAccountMember(
  client: Moltin,
  tokenStore: TokenStore,
) {
  const token = tokenStore.getToken()

  if (!token) {
    return undefined
  }

  const parsedToken: AccountTokenBase & { account_member_id: string } =
    JSON.parse(token)

  const decodedToken = parsedToken?.token
    ? jwtDecode<{ sub?: string }>(parsedToken.token)
    : undefined

  if (!decodedToken) {
    return undefined
  }

  const { sub: accountMemberId } = decodedToken

  if (!accountMemberId) {
    return undefined
  }

  try {
    const result: Resource<AccountMember> = await client.request.send(
      `account_members/${accountMemberId}`,
      "GET",
      undefined,
      undefined,
      client,
      undefined,
      "v2",
      {
        "EP-Account-Management-Authentication-Token": token,
      },
    )

    return result
  } catch (error) {
    console.error(error)
    return undefined
  }
}
