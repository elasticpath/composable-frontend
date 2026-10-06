"use client"
import { useMemo, useEffect, useState, type JSX, useRef } from "react"
import { useElasticPathClient } from "src/app/[lang]/(store)/ClientProvider"

import {
  Breadcrumb,
  Configure,
  HierarchicalMenu,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
} from "react-instantsearch"
import CatalogSearchInstantSearchAdapter from "@elasticpath/catalog-search-instantsearch-adapter"
import { Panel } from "./Panel"
import { Autocomplete } from "./Autocomplete"
import { RangeSlider } from "./RangeSlider"
import {
  INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
  resolveInstantSearchRouting,
} from "src/lib/instantsearch-routing"
import {
  InstantSearchNext,
  createInstantSearchNextInstance,
} from "react-instantsearch-nextjs"
import { useParams } from "next/navigation"

import "instantsearch.css/themes/satellite.css"
import { useCurrencies } from "src/hooks/use-currencies"
import { getCurrencyCodeForLocale, getPreferredCurrency } from "src/lib/i18n"
import { HitsWithImages } from "./HitsWithImages"
import { SortBy } from "./SortBy"
import { EXCLUDE_CHILD_PRODUCTS_FILTER } from "src/lib/product-family"
import {
  TAXONOMY_FACET_FIELD,
  taxonomyFacetLabel,
} from "src/lib/search-taxonomy-facet"
import { emptyResultsOnServerFailure } from "src/lib/empty-results-on-server-failure"

const categoryPageInstance = createInstantSearchNextInstance()

export default function InstantSearchResults(): JSX.Element {
  const { client } = useElasticPathClient()
  const { lang } = useParams()
  const { data: currencies } = useCurrencies()
  const preferredCurrency = getPreferredCurrency(
    lang as string,
    currencies || [],
  )
  const currencyCode =
    preferredCurrency?.code || getCurrencyCodeForLocale(lang as string)

  const searchClient = useMemo(() => {
    const catalogSearchInstantSearchAdapter =
      new CatalogSearchInstantSearchAdapter({
        client: client,
      })
    return emptyResultsOnServerFailure(
      catalogSearchInstantSearchAdapter.searchClient,
      typeof window === "undefined",
    )
  }, [client])

  const priceAttribute = `price.${currencyCode}.float_price`

  const routing = resolveInstantSearchRouting(
    lang as string,
    currencyCode,
    TAXONOMY_FACET_FIELD,
  )

  return (
    <InstantSearchNext
      indexName="search"
      searchClient={searchClient}
      routing={routing}
      future={{
        preserveSharedStateOnUnmount: true,
      }}
      instance={categoryPageInstance}
    >
      {/* Filtered here so paging and facet counts come from the server. */}
      <Configure
        filters={EXCLUDE_CHILD_PRODUCTS_FILTER}
        attributesToSnippet={["attributes.name:7", "attributes.description:15"]}
        snippetEllipsisText="…"
      />
      <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-[1fr_3fr] mx-auto max-w-[1200px] w-full px-4 md:px-6">
        {" "}
        {/* mt-4 */}
        <div>
          <Panel
            header="Categories"
            widget={{
              type: "hierarchicalMenu",
              attributes: INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES,
            }}
          >
            <HierarchicalMenu
              attributes={INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES}
              showMore={true}
            />
          </Panel>
          {TAXONOMY_FACET_FIELD && (
            <Panel
              header={taxonomyFacetLabel(TAXONOMY_FACET_FIELD)}
              widget={{
                type: "refinementList",
                attribute: TAXONOMY_FACET_FIELD,
              }}
            >
              <RefinementList
                attribute={TAXONOMY_FACET_FIELD}
                limit={10}
                showMore={true}
                showMoreLimit={50}
                sortBy={["count:desc", "name:asc"]}
              />
            </Panel>
          )}
          <Panel
            header="Price"
            widget={{ type: "range", attribute: priceAttribute }}
          >
            <RangeSlider attribute={priceAttribute} />
          </Panel>
        </div>
        <div>
          <div className="mb-4">
            <Autocomplete
              searchClient={searchClient}
              placeholder="Search products"
              detachedMediaQuery="none"
              openOnFocus
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumb
              attributes={INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES}
              classNames={{
                root: "flex my-2",
              }}
            />
            <SortBy currencyCode={currencyCode} />
          </div>
          <HitsWithImages preferredCurrency={preferredCurrency} />
          <Pagination
            classNames={{
              root: "flex justify-center my-8",
            }}
          />
        </div>
      </div>
    </InstantSearchNext>
  )
}
