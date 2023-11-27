import { useElasticPath } from "../../elasticpath/elasticpath"
import { UseQueryOptionsWrapper } from "../../types"
import { AccountMember, Resource } from "@moltin/sdk"
import { useQuery } from "@tanstack/react-query"
import { queryKeysFactory } from "../../shared/util/query-keys-factory"
import { UseQueryResult } from "@tanstack/react-query/src/types"

const ACCOUNT_MEMBER_QUERY_KEY = "account-member" as const

export const accountMemberQueryKeys = queryKeysFactory(ACCOUNT_MEMBER_QUERY_KEY)
type AccountMemberQueryKey = typeof accountMemberQueryKeys
type Temp = UseQueryResult<Resource<AccountMember> | undefined, Error>

export function useAccountMember(
  id: string,
  options?: UseQueryOptionsWrapper<
    Resource<AccountMember>,
    Error,
    ReturnType<AccountMemberQueryKey["detail"]>
  > & { ep?: { accountMemberToken?: string } },
): Partial<Resource<AccountMember>> &
  Omit<UseQueryResult<Resource<AccountMember>, Error>, "data"> {
  const { client } = useElasticPath()
  const { data, ...rest } = useQuery({
    queryKey: accountMemberQueryKeys.detail(id),
    queryFn: () =>
      client.request.send(
        `account-members/${id}`,
        "GET",
        undefined,
        undefined,
        client,
        undefined,
        "v2",
        {
          ...(options?.ep?.accountMemberToken && {
            "EP-Account-Management-Authentication-Token":
              options.ep.accountMemberToken,
          }),
        },
      ),
    ...options,
  })

  return { ...data, ...rest } as const
}
