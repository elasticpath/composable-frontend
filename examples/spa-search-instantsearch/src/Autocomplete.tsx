import type { BaseItem } from "@algolia/autocomplete-core"
import type { AutocompleteOptions } from "@algolia/autocomplete-js"
import { postMultiSearch } from "@epcc-sdk/sdks-shopper"

import {
  createElement,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createRoot, Root } from "react-dom/client"

import {
  useHierarchicalMenu,
  usePagination,
  useSearchBox,
} from "react-instantsearch"
import { autocomplete } from "@algolia/autocomplete-js"
import { createLocalStorageRecentSearchesPlugin } from "@algolia/autocomplete-plugin-recent-searches"
// import { createQuerySuggestionsPlugin } from "@algolia/autocomplete-plugin-query-suggestions"
import { debounce } from "@algolia/autocomplete-shared"

import { INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES } from "./constants.ts"

// @ts-expect-error no types for this package
import "@algolia/autocomplete-theme-classic"

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
  searchClient: SearchClient
  className?: string
}

type SetInstantSearchUiStateOptions = {
  query: string
  category?: string
}

export function Autocomplete({
  searchClient,
  className,
  ...autocompleteProps
}: AutocompleteProps) {
  const autocompleteContainer = useRef<HTMLDivElement>(null)
  const panelRootRef = useRef<Root | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  const { query, refine: setQuery } = useSearchBox()
  const { items: categories, refine: setCategory } = useHierarchicalMenu({
    attributes: INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
  })
  const { refine: setPage } = usePagination()

  const [instantSearchUiState, setInstantSearchUiState] =
    useState<SetInstantSearchUiStateOptions>({ query })
  const debouncedSetInstantSearchUiState = debounce(
    setInstantSearchUiState,
    500,
  )

  useEffect(() => {
    setQuery(instantSearchUiState.query)
    instantSearchUiState.category && setCategory(instantSearchUiState.category)
    setPage(0)
  }, [instantSearchUiState])

  const currentCategory = useMemo(
    () => categories.find(({ isRefined }) => isRefined)?.value,
    [categories],
  )

  const plugins = useMemo(() => {
    const recentSearches = createLocalStorageRecentSearchesPlugin({
      key: "instantsearch",
      limit: 3,
      transformSource({ source }) {
        return {
          ...source,
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.label,
              category: item.category,
            })
          },
        }
      },
    })

    // const querySuggestionsInCategory = createQuerySuggestionsPlugin({
    //   searchClient,
    //   indexName: INSTANT_SEARCH_QUERY_SUGGESTIONS,
    //   getSearchParams() {
    //     return recentSearches.data!.getAlgoliaSearchParams({
    //       hitsPerPage: 3,
    //       facetFilters: [
    //         `${INSTANT_SEARCH_INDEX_NAME}.facets.exact_matches.${INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES[0]}.value:${currentCategory}`,
    //       ],
    //     })
    //   },
    //   transformSource({ source }) {
    //     return {
    //       ...source,
    //       sourceId: "querySuggestionsInCategoryPlugin",
    //       onSelect({ item }) {
    //         setInstantSearchUiState({
    //           query: item.query,
    //           category: item.__autocomplete_qsCategory,
    //         })
    //       },
    //       getItems(params) {
    //         if (!currentCategory) {
    //           return []
    //         }
    //
    //         return source.getItems(params)
    //       },
    //       templates: {
    //         ...source.templates,
    //         header({ items }) {
    //           if (items.length === 0) {
    //             return <Fragment />
    //           }
    //
    //           return (
    //             <Fragment>
    //               <span className="aa-SourceHeaderTitle">
    //                 In {currentCategory}
    //               </span>
    //               <span className="aa-SourceHeaderLine" />
    //             </Fragment>
    //           )
    //         },
    //       },
    //     }
    //   },
    // })
    //
    // const querySuggestions = createQuerySuggestionsPlugin({
    //   searchClient,
    //   indexName: INSTANT_SEARCH_QUERY_SUGGESTIONS,
    //   getSearchParams() {
    //     if (!currentCategory) {
    //       return recentSearches.data!.getAlgoliaSearchParams({
    //         hitsPerPage: 6,
    //       })
    //     }
    //
    //     return recentSearches.data!.getAlgoliaSearchParams({
    //       hitsPerPage: 3,
    //       facetFilters: [
    //         `${INSTANT_SEARCH_INDEX_NAME}.facets.exact_matches.${INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES[0]}.value:-${currentCategory}`,
    //       ],
    //     })
    //   },
    //   categoryAttribute: [
    //     INSTANT_SEARCH_INDEX_NAME,
    //     "facets",
    //     "exact_matches",
    //     INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES[0],
    //   ],
    //   transformSource({ source }) {
    //     return {
    //       ...source,
    //       sourceId: "querySuggestionsPlugin",
    //       onSelect({ item }) {
    //         setInstantSearchUiState({
    //           query: item.query,
    //           category: item.__autocomplete_qsCategory || "",
    //         })
    //       },
    //       getItems(params) {
    //         if (!params.state.query) {
    //           return []
    //         }
    //
    //         return source.getItems(params)
    //       },
    //       templates: {
    //         ...source.templates,
    //         header({ items }) {
    //           if (!currentCategory || items.length === 0) {
    //             return <Fragment />
    //           }
    //
    //           return (
    //             <Fragment>
    //               <span className="aa-SourceHeaderTitle">
    //                 In other categories
    //               </span>
    //               <span className="aa-SourceHeaderLine" />
    //             </Fragment>
    //           )
    //         },
    //       },
    //     }
    //   },
    // })

    return [recentSearches]

    // return [recentSearches, querySuggestionsInCategory, querySuggestions]
  }, [currentCategory])

  useEffect(() => {
    if (!autocompleteContainer.current) {
      return
    }

    const autocompleteInstance = autocomplete({
      ...autocompleteProps,
      container: autocompleteContainer.current,
      initialState: { query },
      insights: true,
      async getSources({ query }) {
        const multisearchResponse = await postMultiSearch({
          body: {
            searches: [
              {
                type: "autocomplete",
                highlight_full_fields: "name",
                q: query || "*",
                include_fields: "name",
              },
            ],
          },
        })

        if (multisearchResponse.error && !multisearchResponse.data) {
          throw new Error(
            `Failed to fetch predictions: ${multisearchResponse.error}`,
          )
        }

        const results = multisearchResponse.data?.results?.[0]

        return [
          {
            sourceId: "predictions",
            getItems() {
              return results?.hits ?? []
            },
            getItemInputValue({ item }) {
              return item.document?.["q"]
            },
            templates: {
              item({ item }) {
                const value =
                  item.highlights.find((h: any) => h.field === "q" || {})
                    ?.snippet || item.document?.["q"]

                if (!value) {
                  return <Fragment />
                }

                return (
                  <Fragment>
                    <span className="aa-ItemContent">
                      <span
                        className="aa-ItemContentTitle"
                        dangerouslySetInnerHTML={{
                          __html: value,
                        }}
                      />
                    </span>
                  </Fragment>
                )
              },
              noResults() {
                return "No results found."
              },
            },
          },
        ]
      },
      plugins,
      onReset() {
        setInstantSearchUiState({ query: "", category: currentCategory })
      },
      onSubmit({ state }) {
        setInstantSearchUiState({ query: state.query })
      },
      onStateChange({ prevState, state }) {
        if (prevState.query !== state.query) {
          debouncedSetInstantSearchUiState({
            query: state.query,
          })
        }
      },
      renderer: { createElement, Fragment, render: () => {} },
      render({ children }, root) {
        if (!panelRootRef.current || rootRef.current !== root) {
          rootRef.current = root

          panelRootRef.current?.unmount()
          panelRootRef.current = createRoot(root)
        }

        panelRootRef.current.render(children)
      },
    })

    return () => autocompleteInstance.destroy()
  }, [plugins])

  return <div className={className} ref={autocompleteContainer} />
}
