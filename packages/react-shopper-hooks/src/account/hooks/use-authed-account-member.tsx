import { useAccountMember } from "./use-account-member"
import { useContext, useEffect, useState } from "react"
import { AccountProviderContext } from "../account-provider"
import Cookies from "js-cookie"
import { AccountMember, AccountTokenBase, Resource } from "@moltin/sdk"
import { UseQueryResult } from "@tanstack/react-query/src/types"
import { AccountCredentials } from "../types"

export function useAuthedAccountMember(): Partial<Resource<AccountMember>> &
  Omit<UseQueryResult<Resource<AccountMember>, Error>, "data"> & {
    accountMemberTokens?: Record<string, AccountTokenBase>
    selectedAccountToken?: AccountTokenBase
  } {
  const ctx = useContext(AccountProviderContext)
  const [accountMemberTokens, setAccountMemberTokens] = useState<
    Record<string, AccountTokenBase> | undefined
  >()
  const [selectedAccountToken, setSelectedAccountToken] = useState<
    AccountTokenBase | undefined
  >()

  if (!ctx) {
    throw new Error(
      "useAuthedAccountMember must be used within an AccountProvider",
    )
  }

  const accountCookie = Cookies.get(ctx.accountCookieName)
  const parsedAccountCookie: AccountCredentials | undefined =
    accountCookie && JSON.parse(accountCookie)

  const selectedAccount =
    parsedAccountCookie?.accounts[parsedAccountCookie?.selected]

  const result = useAccountMember(parsedAccountCookie?.accountMemberId ?? "", {
    enabled: !!accountCookie && !!parsedAccountCookie?.accountMemberId,
    ep: { accountMemberToken: selectedAccount?.token },
  })

  useEffect(() => {
    setAccountMemberTokens(ctx.getAccountMemberTokens())
    setSelectedAccountToken(ctx.getSelectedAccountToken())
  }, [result.data])

  return {
    ...result,
    accountMemberTokens,
    selectedAccountToken,
  } as const
}
