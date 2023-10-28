"use client";
import { searchClient } from "../../lib/search-client";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { algoliaEnvData } from "../../lib/resolve-algolia-env";
import { resolveAlgoliaRouting } from "../../lib/algolia-search-routing";
import SearchResults from "../../components/search/SearchResults";
import React from "react";
import { buildBreadcrumbLookup } from "../../lib/build-breadcrumb-lookup";
import { useStore } from "@elasticpath/react-shopper-hooks";
import {
  HierarchicalMenuProps,
  PaginationProps,
  RangeInputProps,
  RefinementListProps,
  SearchBoxProps,
  SortByProps,
  useHierarchicalMenu,
  usePagination,
  useRange,
  useRefinementList,
  useSearchBox,
  useSortBy,
} from "react-instantsearch";
import { sortByItems } from "../../lib/sort-by-items";
import { hierarchicalAttributes } from "../../lib/hierarchical-attributes";

export function Search() {
  const { nav } = useStore();
  const lookup = buildBreadcrumbLookup(nav ?? []);

  return (
    <InstantSearchNext
      indexName={algoliaEnvData.indexName}
      searchClient={searchClient}
      routing={resolveAlgoliaRouting()}
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      {/* Virtual widgets are here as a workaround for this issue https://github.com/algolia/instantsearch/issues/5890 */}
      <VirtualSearchBox autoCapitalize="off" />
      <VirtualPagination />
      <VirtualSortBy items={sortByItems} />
      <VirtualRangeInput attribute="ep_price" />
      <VirtualRefinementList attribute="price" />
      <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
      <SearchResults lookup={lookup} />
    </InstantSearchNext>
  );
}

function VirtualHierarchicalMenu(props: HierarchicalMenuProps) {
  useHierarchicalMenu(props);
  return null;
}
function VirtualSearchBox(props: SearchBoxProps) {
  useSearchBox(props);
  return null;
}
function VirtualPagination(props: PaginationProps) {
  usePagination(props);
  return null;
}
function VirtualSortBy(props: SortByProps) {
  useSortBy(props);
  return null;
}

function VirtualRangeInput(props: RangeInputProps) {
  useRange(props);
  return null;
}

function VirtualRefinementList(props: RefinementListProps) {
  useRefinementList(props);
  return null;
}
