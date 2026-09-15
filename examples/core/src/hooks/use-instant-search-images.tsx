import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getAllFiles, type ElasticPathFile, type Client } from "@epcc-sdk/sdks-shopper"
import { useMemo } from "react"
import { useElasticPathClient } from "src/app/[lang]/(store)/ClientProvider"

function extractMainImageIds(hits: any[]): string[] {
  return hits
    .map((hit) => hit?.relationships?.main_image?.data?.id)
    .filter((id: string | undefined): id is string => Boolean(id))
}

export function useInstantSearchImages(
  hits: any[],
  // Resolved in the same request as the hits' own images.
  additionalImageIds: string[] = [],
): ElasticPathFile[] {
  const { client } = useElasticPathClient()
  const additionalKey = [...additionalImageIds].sort().join(",")
  const mainImageIds = useMemo(
    () => [
      ...new Set([...extractMainImageIds(hits), ...additionalImageIds.filter(Boolean)]),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hits, additionalKey],
  )

  const { data: filesResponse } = useQuery({
    queryKey: ['instant-search-images', mainImageIds.sort().join(',')],
    queryFn: async () => {
      if (mainImageIds.length === 0) {
        return { data: { data: [] } }
      }
      return getAllFiles({
        client,
        query: {
          filter: `in(id,${mainImageIds.join(',')})`,
        },
      })
    },
    enabled: mainImageIds.length > 0,
    // Hold the images already resolved while the next set loads, so a page of
    // cards does not drop to placeholders.
    placeholderData: keepPreviousData,
  })

  // Memoised: a fresh array on every render would change the identity of
  // anything built from it, and a new hit component remounts every card.
  return useMemo(() => filesResponse?.data?.data ?? EMPTY_FILES, [filesResponse])
}

const EMPTY_FILES: ElasticPathFile[] = []
