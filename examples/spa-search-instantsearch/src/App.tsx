import { useEffect, useState } from "react"
import "./App.css"
import { postMultiSearch, SearchResult } from "@epcc-sdk/sdks-shopper"

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
