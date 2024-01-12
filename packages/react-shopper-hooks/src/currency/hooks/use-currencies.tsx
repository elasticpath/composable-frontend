import { useElasticPath } from "../../elasticpath"
import { UseQueryOptionsWrapper } from "../../types"
import type { Currency, ResourcePage } from "@moltin/sdk"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { queryKeysFactory } from "../../shared/util/query-keys-factory"

const CURRENCY_QUERY_KEY = "currency" as const

export const currencyQueryKeys = queryKeysFactory(CURRENCY_QUERY_KEY)
type CurrencyQueryKey = typeof currencyQueryKeys

export function useCurrencies(
  options?: UseQueryOptionsWrapper<
    ResourcePage<Currency, never>,
    Error,
    ReturnType<CurrencyQueryKey["list"]>
  >,
): Partial<ResourcePage<Currency, never>> &
  Omit<UseQueryResult<ResourcePage<Currency, never>, Error>, "data"> {
  const { client } = useElasticPath()
  const { data, ...rest } = useQuery({
    queryKey: currencyQueryKeys.list(),
    queryFn: () => client.Currencies.All(),
    ...options,
  })
  return { ...data, ...rest } as const
}
