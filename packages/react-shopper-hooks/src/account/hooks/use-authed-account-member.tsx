import { useAccountMember } from "./use-account-member"
import { useContext } from "react"
import { AccountProviderContext } from "../account-provider"
import Cookies from "js-cookie"
import {
  createCookieTokenStore,
  resolveAccountMemberIdFromToken,
} from "../login-account"
import { useElasticPath } from "../../elasticpath/elasticpath"
import { AccountMember, Resource } from "@moltin/sdk"
import { UseQueryResult } from "@tanstack/react-query/src/types"

export function useAuthedAccountMember(): Partial<Resource<AccountMember>> &
  Omit<UseQueryResult<Resource<AccountMember>, Error>, "data"> {
  const ctx = useContext(AccountProviderContext)

  if (!ctx) {
    throw new Error(
      "useAuthedAccountMember must be used within an AccountProvider",
    )
  }

  const { client } = useElasticPath()

  const tokenStore = createCookieTokenStore(ctx.accountCookieName)
  const authedAccountMemberId = resolveAccountMemberIdFromToken(
    client,
    tokenStore,
  )
  const accountCookie = Cookies.get(ctx.accountCookieName)

  const result = useAccountMember(authedAccountMemberId ?? "", {
    enabled: !!accountCookie && !!authedAccountMemberId,
    ep: { accountMemberToken: accountCookie },
  })

  return { ...result } as const
}
