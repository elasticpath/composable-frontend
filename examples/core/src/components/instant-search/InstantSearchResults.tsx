"use client";
import { useMemo, useEffect, useState, type JSX, useRef } from "react";
import { useElasticPathClient } from "src/app/[lang]/(store)/ClientProvider";

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
import { Panel } from "./Panel";
import { Hit } from "./Hit";
import { Autocomplete } from "./Autocomplete";
import { RangeSlider } from "./RangeSlider";
import { useParams } from "next/navigation";

import "instantsearch.css/themes/satellite.css"

export default function InstantSearchResults(): JSX.Element {
  const { client } = useElasticPathClient();
  const { lang } = useParams();

  const searchClient = useMemo(() => {
    const catalogSearchInstantSearchAdapter = new CatalogSearchInstantSearchAdapter({
      client: client,
    });
    return catalogSearchInstantSearchAdapter.searchClient;
  }, [client]);

  return (
    <InstantSearch indexName="search" searchClient={searchClient}>
      <Configure
        attributesToSnippet={[
          "attributes.name:7",
          "attributes.description:15",
        ]}
        snippetEllipsisText="…"
      />
      <div className="p-6 grid gap-4 grid-cols-[1fr_3fr] mx-auto max-w-[1200px] w-full px-6"> {/* mt-4 */}
        <div>
          <Panel header="Categories">
            <HierarchicalMenu
              attributes={INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES}
              showMore={true}
            />
          </Panel>
          {/* <div className="my-4" /> */}
          {/* <Panel header="Brands">
           <RefinementList
             attribute="extensions.Details.BRAND-NAME"
             limit={25}
             showMore={true}
             showMoreLimit={50}
             sortBy={["count:desc"]}
           />
          </Panel> */}
          <div className="my-4" />
          <Panel header="Price">
            <RangeSlider attribute={`price.${currencyCode}.float_price`} />
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
          <Breadcrumb
            attributes={INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES}
            classNames={{
              root: "flex my-2",
            }}
          />
          <Hits
            hitComponent={(props) => <Hit {...props} preferredCurrency={preferredCurrency} />}
            classNames={{
              root: "w-full",
              list: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
              item: "flex items-center !p-4 bg-white rounded-md shadow-sm hover:shadow-md transition",
            }}
          />
          <Pagination
            classNames={{
              root: "flex justify-center my-8",
            }}
          />
        </div>
      </div>
    </InstantSearch>
  );
}
