import { useQuery } from "@tanstack/react-query"
import { postMultiSearch } from "@epcc-sdk/sdks-shopper"
import { useMemo } from "react"
import { useElasticPathClient } from "src/app/[lang]/(store)/ClientProvider"
import { collectVariantProductIds } from "src/lib/product-family"

/**
 * What a card needs to stand for one variant rather than for the parent.
 */
export type Variant = {
  id: string
  slug?: string
  formattedPrice?: string
  // The raw amount as well as the formatted string, so a card can compare
  // variants and quote the cheapest without parsing currency back out of text.
  amount?: number
  mainImageId?: string
}

export type VariantLookup = Record<string, Variant>

/**
 * Resolves every variant behind the families on a page of search results.
 *
 * Search results hold parent products only, and a parent carries neither its
 * children's prices nor their images. The parents do carry the ids, though, in
 * `meta.variation_matrix`, and `id` is a filterable field — so the whole page
 * resolves in one request, however many families it holds. Fetching per card
 * would scale with the page size instead.
 */
export function useInstantSearchVariants(hits: any[]): VariantLookup {
  const { client } = useElasticPathClient()
  const variantIds = useMemo(() => collectVariantProductIds(hits), [hits])

  const { data } = useQuery({
    queryKey: ["instant-search-variants", [...variantIds].sort().join(",")],
    enabled: variantIds.length > 0,
    queryFn: async () => {
      return postMultiSearch({
        client,
        body: {
          searches: [
            {
              type: "search",
              q: "*",
              per_page: variantIds.length,
              filter_by: `id:=[${variantIds.join(",")}]`,
            },
          ],
        },
      })
    },
  })

  return useMemo(() => {
    const hitsForVariants = data?.data?.results?.[0]?.hits ?? []

    return hitsForVariants.reduce<VariantLookup>((lookup, hit) => {
      const document = hit.document as any
      const id = document?.id

      if (typeof id !== "string") {
        return lookup
      }

      // The index reports a variant's price under `without_tax` here.
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
          mainImageId: document?.relationships?.main_image?.data?.id,
        },
      }
    }, {})
  }, [data])
}
