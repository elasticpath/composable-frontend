# @elasticpath/catalog-search-instantsearch-adapter

An adapter that enables you to use the [InstantSearch.js](https://github.com/algolia/instantsearch) library with [Elastic Path's Catalog Search API](https://elasticpath.com).

Elastic Path's Catalog Search API provides a powerful search and discovery experience for your commerce catalog. This adapter translates InstantSearch.js requests into Catalog Search API requests and transforms the responses back into InstantSearch format.

## Features

- 🔄 Seamless integration with InstantSearch.js widgets
- 🔍 Full-text search with highlighting
- 🎛️ Faceted search and filtering
- 📄 Pagination and result sorting
- ⚡ Support for both vanilla JS and React InstantSearch
- 🎯 Union search support for unified results

## Demo

Try out the [repo](https://github.com/elasticpath/composable-frontend/tree/main/examples/spa-search-instantsearch) to see the adapter in action.

## Quick Start

### Installation

```bash
npm install @elasticpath/catalog-search-instantsearch-adapter
```

or

```bash
yarn add @elasticpath/catalog-search-instantsearch-adapter
```

or

```bash
pnpm add @elasticpath/catalog-search-instantsearch-adapter
```

You'll also need to install InstantSearch.js:

```bash
npm install instantsearch.js
# or for React
npm install react-instantsearch
```

### Basic Usage

```javascript
import instantsearch from 'instantsearch.js';
import CatalogSearchInstantSearchAdapter from '@elasticpath/catalog-search-instantsearch-adapter';
import { configureClient, client } from '@epcc-sdk/sdks-shopper';

// Configure your Elastic Path shopper client with built-in auth
configureClient(
  {
    baseUrl: 'https://euwest.api.elasticpath.com',
  },
  {
    clientId: 'YOUR_CLIENT_ID',
    storage: 'localStorage', // Optional: persist tokens
  }
);

// Create the adapter
const catalogSearchAdapter = new CatalogSearchInstantSearchAdapter({
  client: client,
  additionalSearchParameters: {
    query_by: 'name,description',
    highlight_full_fields: 'name,description',
  },
});

// Initialize InstantSearch with the adapter
const search = instantsearch({
  indexName: 'search',
  searchClient: catalogSearchAdapter.searchClient,
});

// Add widgets
search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
  }),
  instantsearch.widgets.refinementList({
    container: '#brand-list',
    attribute: 'extensions.products(product_brands).name',
  }),
]);

search.start();
```

### With React

```jsx
import React from 'react';
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Pagination,
} from 'react-instantsearch';
import CatalogSearchInstantSearchAdapter from '@elasticpath/catalog-search-instantsearch-adapter';
import { configureClient, client } from '@epcc-sdk/sdks-shopper';

// Configure authentication (typically done once in your app initialization)
configureClient(
  {
    baseUrl: 'https://euwest.api.elasticpath.com',
  },
  {
    clientId: 'YOUR_CLIENT_ID',
    storage: 'localStorage',
  }
);

// Create the adapter
const catalogSearchAdapter = new CatalogSearchInstantSearchAdapter({
  client: client,
});

function Search() {
  return (
    <InstantSearch 
      indexName="search" 
      searchClient={catalogSearchAdapter.searchClient}
    >
      <SearchBox />
      <div className="search-panel">
        <div className="search-panel__filters">
          <RefinementList attribute="extensions.products(product_brands).name" />
        </div>
        <div className="search-panel__results">
          <Hits />
          <Pagination />
        </div>
      </div>
    </InstantSearch>
  );
}
```

## Index Name Configuration

The `indexName` parameter in InstantSearch configuration determines which Elastic Path search endpoint to use:

- **`indexName: 'search'`** - For regular product search (required)
- **`indexName: 'autocomplete'`** - For autocomplete/suggestions (when using with autocomplete.js)

These values map directly to the `type` parameter in Elastic Path's Catalog Search API.

## Configuration Options

### Constructor Parameters

```javascript
const adapter = new CatalogSearchInstantSearchAdapter({
  // Required: Pre-configured Elastic Path shopper SDK client
  client: shopperClient,
});
```

## Widget Compatibility

The adapter supports most InstantSearch widgets out of the box:

### ✅ Supported Widgets

- **Search**
  - `searchBox` - Basic search input
  - `autocomplete` - Search with suggestions (use with `indexName: 'autocomplete'`)
  - `voiceSearch` - Voice input support

- **Results**
  - `hits` - Display search results  
  - `infiniteHits` - Infinite scrolling results
  - `highlight` - Highlight matching terms
  - `snippet` - Show text snippets

- **Filtering**
  - `refinementList` - Filter by facet values
  - `hierarchicalMenu` - Category navigation
  - `rangeSlider` / `rangeInput` - Numeric range filters
  - `toggleRefinement` - Boolean filters
  - `clearRefinements` - Clear all filters
  - `currentRefinements` - Show active filters

- **Pagination**
  - `pagination` - Page navigation
  - `hitsPerPage` - Results per page selector
  
- **Metadata**
  - `stats` - Search statistics
  - `breadcrumb` - Navigation breadcrumb

### ⚠️ Widgets with Limitations

- `geoSearch` - Not supported (Elastic Path doesn't support geo-search)
- `queryRuleCustomData` - Limited support
- `sortBy` - Use `configure` widget with `additionalSearchParameters.sort_by`

### Widget Usage Examples

#### Hierarchical Categories
```javascript
instantsearch.widgets.hierarchicalMenu({
  container: '#categories',
  attributes: [
    'categories.lvl0',
    'categories.lvl1',
    'categories.lvl2',
  ],
});
```

#### Price Range Filter
```javascript
instantsearch.widgets.rangeSlider({
  container: '#price-range',
  attribute: 'price.USD.float_price',
});
```

#### Custom Refinement List
```javascript
instantsearch.widgets.refinementList({
  container: '#brands',
  attribute: 'extensions.products(product_brands).name',
  limit: 10,
  showMore: true,
  showMoreLimit: 50,
  searchable: true,
  searchablePlaceholder: 'Search brands',
});
```

## Union Search

The adapter supports union search to query multiple collections simultaneously:

```javascript
const adapter = new CatalogSearchInstantSearchAdapter({
  client: client,
  union: true,
});
```

## Compatibility

| Elastic Path Catalog Search | InstantSearch.js | Adapter Version |
|---------------------------|------------------|-----------------|
| v1.x | v4.x | 0.0.x |
| v1.x | v3.x | 0.0.x |

## Migration from Algolia

If you're migrating from Algolia to Elastic Path, most of your InstantSearch implementation will work without changes. Key differences:

1. Replace the Algolia search client with this adapter
2. Update attribute names to match your Elastic Path catalog structure
3. Configure authentication using Elastic Path SDK instead of Algolia API keys

## Examples

Check out our [examples directory](https://github.com/elasticpath/composable-frontend/tree/main/examples/spa-search-instantsearch) for complete implementations:

- [React InstantSearch Example](https://github.com/elasticpath/composable-frontend/tree/main/examples/spa-search-instantsearch) - Full-featured search UI with React
- [Vanilla JS Example](https://github.com/elasticpath/composable-frontend/tree/main/examples/spa-search-instantsearch) - Pure JavaScript implementation

## Support

- 📚 [Elastic Path Documentation](https://elasticpath.dev)

## License

MIT

