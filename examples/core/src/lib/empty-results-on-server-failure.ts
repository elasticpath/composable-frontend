type SearchRequest = {
  indexName: string
  params?: { query?: string; hitsPerPage?: number }
}

type Searchable = {
  search: (requests: any) => Promise<any>
}

export function emptyResultsOnServerFailure<TClient extends Searchable>(
  searchClient: TClient,
  isServer: boolean,
): TClient {
  return {
    ...searchClient,
    search: (requests: SearchRequest[]) =>
      searchClient.search(requests).catch((error: unknown) => {
        if (!isServer) throw error
        return { results: requests.map(emptyResult) }
      }),
  }
}

function emptyResult({ indexName, params }: SearchRequest) {
  return {
    hits: [],
    nbHits: 0,
    nbPages: 0,
    page: 0,
    hitsPerPage: params?.hitsPerPage ?? 0,
    processingTimeMS: 0,
    exhaustiveNbHits: true,
    query: params?.query ?? "",
    params: "",
    index: indexName,
  }
}
