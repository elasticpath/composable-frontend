/* eslint-disable  @typescript-eslint/no-explicit-any */
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
import { debounce } from "@algolia/autocomplete-shared"

import { INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES } from "src/lib/instantsearch-routing"
import type { SearchClient } from "instantsearch.js"

import "@algolia/autocomplete-theme-classic"
import { useElasticPathClient } from "src/app/[lang]/(store)/ClientProvider"

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
  searchClient: SearchClient
  className?: string
}

type SetInstantSearchUiStateOptions = {
  query: string
  category?: string
}

export function Autocomplete({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // Elastic Path category paths use ">" as their hierarchy separator.
    separator: ">",
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
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
    return [recentSearches]
  }, [currentCategory])

  const { client } = useElasticPathClient()

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
          client: client,
          body: {
            searches: [
              {
                type: "autocomplete",
                highlight_full_fields: "name",
                q: query || "*",
                // @ts-expect-error not yet added
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
              return (item.document as any)?.["q"]
            },
            templates: {
              item({ item }) {
                const value =
                  (item.highlights as any).find((h: any) => h.field === "q" || {})
                    ?.snippet || (item.document as any)?.["q"]

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
