"use client"

import { useElasticPath } from "../../elasticpath/elasticpath"
import { UseQueryOptionsWrapper } from "../../types"
import type { Cart, CartIncluded, ResourceIncluded } from "@elasticpath/js-sdk"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { queryKeysFactory } from "../../shared/util/query-keys-factory"

const CARTS_QUERY_KEY = "carts" as const

export const cartQueryKeys = queryKeysFactory(CARTS_QUERY_KEY)
export type CartQueryKey = typeof cartQueryKeys

export function useGetCart(
  id: string,
  options?: UseQueryOptionsWrapper<
    ResourceIncluded<Cart, CartIncluded>,
    Error,
    ReturnType<CartQueryKey["detail"]>
  >,
) {
  const { client } = useElasticPath()

  return useQuery({
    queryKey: cartQueryKeys.detail(id),
    queryFn: () => client.Cart(id).With("items").Get(),
    ...options,
  })
}
