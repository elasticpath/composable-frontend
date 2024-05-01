import { useElasticPath } from "../../elasticpath/elasticpath"
import { UseQueryOptionsWrapper } from "../../types"
import type {
  Moltin,
  ShopperCatalogResourcePage,
  ProductResponse,
} from "@moltin/sdk"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { queryKeysFactory } from "../../shared/util/query-keys-factory"

const PRODUCTS_QUERY_KEY = "products" as const

export const productsQueryKeys = queryKeysFactory(PRODUCTS_QUERY_KEY)
type ProductsQueryKey = typeof productsQueryKeys

export type UseProductsParams = NonNullable<
  Parameters<Moltin["ShopperCatalog"]["Products"]["All"]>
>[0]

export type ShopperCatalogProductsInclude =
  | "main_image"
  | "files"
  | "component_products"

export function useProducts(
  params?: UseProductsParams & {
    limit?: number
    offset?: number
    filter?: object
    include?: ShopperCatalogProductsInclude | ShopperCatalogProductsInclude[]
  },
  options?: UseQueryOptionsWrapper<
    ShopperCatalogResourcePage<ProductResponse>,
    Error,
    ReturnType<ProductsQueryKey["list"]>
  >,
): UseQueryResult<ShopperCatalogResourcePage<ProductResponse>, Error> {
  const { client } = useElasticPath()

  const { limit = 25, offset = 0, filter = {}, include = [] } = params ?? {}

  return useQuery({
    queryKey: [
      ...productsQueryKeys.list({ limit, offset, filter, include, ...options }),
    ],
    queryFn: () =>
      client.ShopperCatalog.Products.Limit(limit)
        .Offset(offset)
        .Filter(filter)
        .With(include)
        .All(),
    ...options,
  })
}
