import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { postMultiSearch } from "@epcc-sdk/sdks-shopper"
import { useMemo } from "react"
import { useElasticPathClient } from "src/app/[lang]/(store)/ClientProvider"
import { collectVariantProductIds } from "src/lib/product-family"

// Search backends cap how many documents one query may return, and the
// filter_by string grows with the id list, so ask in batches.
const IDS_PER_SEARCH = 100

export type Variant = {
  id: string
  slug?: string
  formattedPrice?: string
  // Compared to find the cheapest, so the formatted string is not enough.
  amount?: number
  currency?: string
  mainImageId?: string
}

export type VariantLookup = Record<string, Variant>

export type VariantResolution = {
  variants: VariantLookup
  /** Nothing is known yet; a card cannot tell a missing price from an unpriced one. */
  isPending: boolean
  isError: boolean
}

/** One request per page of results, however many families it holds. */
export function useInstantSearchVariants(hits: any[]): VariantResolution {
  const { client } = useElasticPathClient()
  const variantIds = useMemo(() => collectVariantProductIds(hits), [hits])

  const { data, isPending, isError } = useQuery({
    queryKey: ["instant-search-variants", [...variantIds].sort().join(",")],
    enabled: variantIds.length > 0,
    // Hold the previous page's variants so prices do not blink out while the
    // next page resolves.
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const batches: string[][] = []
      for (let i = 0; i < variantIds.length; i += IDS_PER_SEARCH) {
        batches.push(variantIds.slice(i, i + IDS_PER_SEARCH))
      }

      return postMultiSearch({
        client,
        body: {
          searches: batches.map((ids) => ({
            type: "search" as const,
            q: "*",
            per_page: ids.length,
            filter_by: `id:=[${ids.join(",")}]`,
          })),
        },
      })
    },
  })

  const variants = useMemo(() => {
    const documents = (data?.data?.results ?? []).flatMap(
      (result: any) => result?.hits ?? [],
    )

    return documents.reduce<VariantLookup>((lookup, hit: any) => {
      const document = hit.document
      const id = document?.id

      if (typeof id !== "string") {
        return lookup
      }

      // `without_tax` first, matching ProductSummary and resolveCardPrice.
      const displayPrice =
        document?.meta?.display_price?.without_tax ??
        document?.meta?.display_price?.with_tax

      return {
        ...lookup,
        [id]: {
          id,
          slug: document?.attributes?.slug,
          formattedPrice: displayPrice?.formatted,
          amount: displayPrice?.amount,
          currency: displayPrice?.currency,
          mainImageId: document?.relationships?.main_image?.data?.id,
        },
      }
    }, {})
  }, [data])

  return {
    variants,
    isPending: variantIds.length > 0 && isPending,
    isError,
  }
}
