import { useElasticPath } from "../../elasticpath/elasticpath"
import { UseQueryOptionsWrapper } from "../../types"
import type { Moltin } from "@moltin/sdk"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { queryKeysFactory } from "../../shared/util/query-keys-factory"
import { ProductResponse, ShopperCatalogResource } from "@moltin/sdk"

const PRODUCTS_QUERY_KEY = "products" as const

export const productQueryKeys = queryKeysFactory(PRODUCTS_QUERY_KEY)
type ProductQueryKey = typeof productQueryKeys

export type UseProductParams = NonNullable<
  Parameters<Moltin["ShopperCatalog"]["Products"]["Get"]>
>[0]

export function useProduct(
  params: UseProductParams,
  options?: UseQueryOptionsWrapper<
    ShopperCatalogResource<ProductResponse>,
    Error,
    ReturnType<ProductQueryKey["detail"]>
  >,
): Partial<ShopperCatalogResource<ProductResponse>> &
  Omit<UseQueryResult<ShopperCatalogResource<ProductResponse>, Error>, "data"> {
  const { client } = useElasticPath()

  const { data, ...rest } = useQuery({
    queryKey: [...productQueryKeys.detail(params.productId)],
    queryFn: () =>
      client.ShopperCatalog.Products.With([
        "main_image",
        "component_products",
        "files",
      ]).Get(params),
    ...options,
  })
  return { ...data, ...rest } as const
}
