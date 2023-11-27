import React, { createContext, ReactNode } from "react"
import { AccountMember } from "@moltin/sdk"

interface AccountState {
  accountCookieName: string
  profile: AccountMember | null
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
  return (
    <AccountProviderContext.Provider
      value={{ accountCookieName, profile: null }}
    >
      {children}
    </AccountProviderContext.Provider>
  )
}
