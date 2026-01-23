import { useQuery } from "@tanstack/react-query"
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
): ElasticPathFile[] {
  const { client } = useElasticPathClient()
  const mainImageIds = useMemo(() => extractMainImageIds(hits), [hits])

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
  })

  return filesResponse?.data?.data ?? []
}
