import type {
  ShopperCatalogResourcePage,
  ProductResponse,
  File,
} from "@moltin/sdk"
import { UseQueryResult } from "@tanstack/react-query"
import {
  ShopperCatalogProductsInclude,
  useProducts,
  UseProductsParams,
  UseProductsQueryOptions,
} from "./use-products"

type UseProductsEnhancedData = ShopperCatalogResourcePage<
  ProductResponse & {
    enhanced: { mainImage: File | null; otherImages: File[] | null }
  }
>

export function useProductsEnhanced(
  params?: UseProductsParams,
  options?: UseProductsQueryOptions,
): UseQueryResult<UseProductsEnhancedData, Error> {
  return useProducts(
    {
      ...params,
      include: combineIncludes(
        ["main_image", "files", "component_products"],
        params,
      ),
    },
    {
      ...options,
      select: (data): UseProductsEnhancedData => {
        const transformedData = options?.select?.(data) ?? data

        const fileLookup = createFileLookupDict(transformedData.included)

        const enhancedData = transformedData.data.map((originalData) => {
          return {
            ...originalData,
            enhanced: {
              mainImage: getProductMainImage(originalData, fileLookup),
              otherImages: getProductOtherImages(originalData, fileLookup),
            },
          }
        })

        return {
          ...transformedData,
          data: enhancedData,
        }
      },
    },
  ) as UseQueryResult<UseProductsEnhancedData, Error>
}

function getProductMainImage(
  product: ProductResponse,
  fileLookup: Record<string, File>,
): File | null {
  const mainImageId = product?.relationships?.main_image?.data?.id
  return mainImageId ? fileLookup[mainImageId] : null
}

function getProductOtherImages(
  product: ProductResponse,
  fileLookup: Record<string, File>,
): File[] | null {
  const otherImagesIds =
    product?.relationships?.files?.data?.map((file) => file.id) ?? []
  const mainImageId = product?.relationships?.main_image?.data?.id
  return otherImagesIds
    .map((id) => fileLookup[id])
    .filter((x) => x.id !== mainImageId)
}

function createFileLookupDict(
  includes: ShopperCatalogResourcePage<ProductResponse>["included"],
): Record<string, File> {
  return (
    includes?.files?.reduce((acc, curr) => {
      return { ...acc, [curr.id]: curr }
    }, {}) ?? {}
  )
}

function combineIncludes(
  include: ShopperCatalogProductsInclude[],
  params: UseProductsParams,
): ShopperCatalogProductsInclude[] {
  return [
    ...new Set<ShopperCatalogProductsInclude>([
      ...include,
      ...extractIncludeFromParams(params),
    ]),
  ]
}

function extractIncludeFromParams(
  params: UseProductsParams,
): ShopperCatalogProductsInclude[] {
  if (!params?.include) {
    return []
  }
  return Array.isArray(params.include) ? params.include : [params.include]
}
