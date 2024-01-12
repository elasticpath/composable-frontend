import React, { createContext, ReactNode } from "react"
import Cookies from "js-cookie"
import { AccountCredentials } from "./types"
import { AccountTokenBase, AccountMember } from "@moltin/sdk"

export interface AccountState {
  accountCookieName: string
  profile: AccountMember | null
  getSelectedAccountToken: () => AccountTokenBase | undefined
  getAccountMemberTokens: () => Record<string, AccountTokenBase> | undefined
}

export const AccountProviderContext = createContext<AccountState | null>(null)

export interface AccountProviderProps {
  accountCookieName?: string
  children: ReactNode
}

export const ACCOUNT_MEMBER_TOKEN_STR = "_store_ep_account_member_token"

export const AccountProvider = ({
  children,
  accountCookieName = ACCOUNT_MEMBER_TOKEN_STR,
}: AccountProviderProps) => {
  function getParsedCookie(): AccountCredentials | undefined {
    const cookie = Cookies.get(accountCookieName)
    return cookie && JSON.parse(cookie)
  }

  function getAccountMemberTokens():
    | Record<string, AccountTokenBase>
    | undefined {
    const parsedCookie = getParsedCookie()

    if (!parsedCookie) {
      return undefined
    }

    return parsedCookie.accounts
  }

  function getSelectedAccountToken(): AccountTokenBase | undefined {
    const parsedCookie = getParsedCookie()

    if (!parsedCookie) {
      return undefined
    }

    const token = parsedCookie.accounts[parsedCookie.selected]

    return token
  }

  return (
    <AccountProviderContext.Provider
      value={{
        accountCookieName,
        getAccountMemberTokens,
        getSelectedAccountToken,
        profile: null
      }}
    >
      {children}
    </AccountProviderContext.Provider>
  )
}
