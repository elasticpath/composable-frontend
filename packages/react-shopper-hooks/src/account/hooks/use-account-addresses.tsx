import { useElasticPath } from "../../elasticpath"
import { UseQueryOptionsWrapper } from "../../types"
import { AccountAddress, ResourcePage } from "@moltin/sdk"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { queryKeysFactory } from "../../shared/util/query-keys-factory"

const ACCOUNT_ADDRESSES_QUERY_KEY = "account-addresses" as const

export const accountAddressesQueryKeys = queryKeysFactory(
  ACCOUNT_ADDRESSES_QUERY_KEY,
)
type AccountAddressesQueryKey = typeof accountAddressesQueryKeys

export function useAccountAddresses(
  accountId: string,
  options?: UseQueryOptionsWrapper<
    ResourcePage<AccountAddress>,
    Error,
    ReturnType<AccountAddressesQueryKey["list"] & string>
  > & { ep?: { accountMemberToken?: string } },
): Partial<ResourcePage<AccountAddress>> &
  Omit<UseQueryResult<ResourcePage<AccountAddress>, Error>, "data"> {
  const { client } = useElasticPath()
  const { data, ...rest } = useQuery({
    queryKey: [...accountAddressesQueryKeys.list({ accountId })],
    queryFn: () =>
      client.AccountAddresses.All({
        account: accountId,
        ...(options?.ep?.accountMemberToken && {
          token: options.ep.accountMemberToken,
        }),
      }),
    ...options,
  })

  return { ...data, ...rest } as const
}
