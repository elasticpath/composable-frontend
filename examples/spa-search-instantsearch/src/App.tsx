import "./App.css"
import { client } from "@epcc-sdk/sdks-shopper"

import "instantsearch.css/themes/satellite.css"
import {
  Breadcrumb,
  Configure,
  HierarchicalMenu,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
} from "react-instantsearch"
import TypesenseInstantSearchAdapter from "@elasticpath/catalog-search-instantsearch-adapter"
import { Panel } from "./Panel"
import { INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES } from "./constants.ts"
import { Hit } from "./Hit.tsx"
import { Autocomplete } from "./Autocomplete.tsx"
import { RangeSlider } from "./RangeSlider.tsx"

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  client: client,
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  query_by is required.
  additionalSearchParameters: {
    // query_by: "name,description,categories",
  },
})
const searchClient = typesenseInstantsearchAdapter.searchClient

function App() {
  return (
    <div>
      <InstantSearch indexName="search" searchClient={searchClient} routing>
        <header className="header">
          <div className="header-wrapper wrapper">
            <nav className="header-nav">
              <a href="/">Home</a>
            </nav>
            <Autocomplete
              searchClient={searchClient}
              placeholder="Search products"
              detachedMediaQuery="none"
              openOnFocus
            />
          </div>
        </header>
        <Configure
          attributesToSnippet={[
            "attributes.name:7",
            "attributes.description:15",
          ]}
          snippetEllipsisText="…"
        />
        <div className="container wrapper">
          <div>
            <Panel header="Categories">
              <HierarchicalMenu
                attributes={INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES}
                showMore={true}
              />
            </Panel>
            <div className="divider" />
            <Panel header="Brands">
              <RefinementList
                attribute="extensions.Details.BRAND-NAME"
                limit={25}
                showMore={true}
                showMoreLimit={50}
                sortBy={["count:desc"]}
              />
            </Panel>

            <div className="divider" />
            <Panel header="Price">
              <RangeSlider attribute="price.USD.float_price" />
            </Panel>
          </div>
          <div>
            <Breadcrumb attributes={INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES} />
            <Hits hitComponent={Hit} />
            <Pagination />
          </div>
        </div>
      </InstantSearch>
    </div>
  )
}

export default App
