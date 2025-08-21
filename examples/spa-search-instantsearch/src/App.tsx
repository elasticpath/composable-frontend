import { useEffect, useState } from "react"
import "./App.css"
import {
  postMultiSearch,
  SearchResult,
  client,
  CatalogSearchProduct,
  Product,
} from "@epcc-sdk/sdks-shopper"

import "instantsearch.css/themes/satellite.css"
import { Hits, InstantSearch, SearchBox } from "react-instantsearch"
import TypesenseInstantSearchAdapter from "@elasticpath/catalog-search-instantsearch-adapter"

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  client: client,
  server: {
    apiKey: "abcd", // Be sure to use an API key that only allows search operations
    nodes: [
      {
        host: "localhost",
        port: "8108",
        path: "", // Optional. Example: If you have your typesense mounted in localhost:8108/typesense, path should be equal to '/typesense'
        protocol: "http",
      },
    ],
    cacheSearchResultsForSeconds: 2 * 60, // Cache search results from server. Defaults to 2 minutes. Set to 0 to disable caching.
  },
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  query_by is required.
  additionalSearchParameters: {
    query_by: "name,description,categories",
  },
})
const searchClient = typesenseInstantsearchAdapter.searchClient

function Hit({ hit }: { hit: CatalogSearchProduct }) {
  const attributes = hit?.attributes as Product["attributes"]

  return (
    <article>
      <img src="https://placehold.co/200" alt={attributes?.name} />
      <div>
        <h1>{attributes?.name}</h1>
        <span>{attributes?.sku}</span>
        <p>{attributes?.description}</p>
      </div>
    </article>
  )
}

function SearchSection() {
  return (
    <InstantSearch indexName="products_orgill" searchClient={searchClient}>
      <SearchBox />
      <Hits hitComponent={Hit} />
    </InstantSearch>
  )
}

function App() {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [query, setQuery] = useState("*")

  const performSearch = async (query: string) => {
    try {
      const response = await postMultiSearch({
        body: {
          searches: [
            {
              query_by: "name,description,categories",
              highlight_full_fields: "name,description,categories",
              collection: "products_orgill",
              q: query,
              page: 1,
            },
          ],
        },
      })
      setSearchResults(response.data?.results?.[0] || null)
    } catch (error) {
      console.error("Failed to search catalog:", error)
    }
  }

  useEffect(() => {
    performSearch(query)
  }, [query])

  return (
    <>
      <div className="mb-6 border-b border-gray-300 pb-3">
        <h1 className="text-xl font-medium mb-2 text-black">
          Catalog search instantsearch demo (SPA)
        </h1>
      </div>
      <div>
        <SearchSection />
      </div>
      <div>
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <div className="relative">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              setQuery(formData.get("search") as string)
            }}
            className="flex"
          >
            <input
              id="search"
              type="search"
              name="search"
              placeholder="Search…"
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-medium mb-3 text-black">
          Search Results List
        </h2>
        {searchResults?.hits?.length === 0 ? (
          <p className="text-black">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults?.hits?.map((hit) => (
              <div
                key={hit.document?.id}
                className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
              >
                <div
                  className="text-base text-black font-semibold mb-1 truncate"
                  title={(hit.document?.attributes?.name as string) ?? ""}
                >
                  {hit.document?.attributes?.name as string}
                </div>
                <div className="text-sm text-gray-600">
                  SKU: {hit.document?.attributes?.sku as string}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default App
