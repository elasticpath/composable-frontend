import { useQuery } from "@tanstack/react-query"
import { useElasticPath } from "../../context/elasticpath"
import type { UseQueryOptionsWrapper } from "../../types"
import type { Cart, CartIncluded, ResourceIncluded } from "@moltin/sdk"
import { queryKeysFactory } from "../utils/query-keys-factory"

const CART_QUERY_KEY = `cart` as const

export const cartKeys = queryKeysFactory(CART_QUERY_KEY)
type CartQueryKey = typeof cartKeys

export const useGetCart = (
  id: string,
  options?: UseQueryOptionsWrapper<
    ResourceIncluded<Cart, CartIncluded>,
    Error,
    ReturnType<CartQueryKey["details"]>
  >,
) => {
  const { client } = useElasticPath()
  const { data, ...rest } = useQuery({
    queryKey: cartKeys.detail(id),
    queryFn: () => client.Cart(id).Items(),
    ...options,
  })
  return { ...data, ...rest } as const
}
