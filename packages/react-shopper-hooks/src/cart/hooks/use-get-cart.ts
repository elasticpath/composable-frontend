import { useElasticPath } from "../../elasticpath/elasticpath"
import { UseQueryOptionsWrapper } from "../../types"
import type { Cart, CartIncluded, ResourceIncluded } from "@moltin/sdk"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { queryKeysFactory } from "../../shared/util/query-keys-factory"

const CARTS_QUERY_KEY = "carts" as const

export const cartQueryKeys = queryKeysFactory(CARTS_QUERY_KEY)
type CartQueryKey = typeof cartQueryKeys

export function useGetCart(
  id: string,
  options?: UseQueryOptionsWrapper<
    ResourceIncluded<Cart, CartIncluded>,
    Error,
    ReturnType<CartQueryKey["detail"]>
  >,
): Partial<ResourceIncluded<Cart, CartIncluded>> &
  Omit<UseQueryResult<ResourceIncluded<Cart, CartIncluded>, Error>, "data"> {
  const { client } = useElasticPath()
  const { data, ...rest } = useQuery({
    queryKey: cartQueryKeys.detail(id),
    queryFn: () => client.Cart(id).With("items").Get(),
    ...options,
  })
  return { ...data, ...rest } as const
}
