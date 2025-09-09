# @elasticpath/catalog-search-instantsearch-adapter

An adapter that enables [InstantSearch.js](https://github.com/algolia/instantsearch) to work seamlessly with Elastic Path's Catalog Search API. This adapter translates InstantSearch.js requests into Elastic Path Catalog Search requests and transforms the responses back into InstantSearch.js format.

## Features

- 🔄 Majority compatibility with InstantSearch.js widgets and components
- 🔍 Support for search queries, facets, filters, and pagination
- ✨ Search result highlighting with customizable tags

## Installation

```bash
npm install @elasticpath/catalog-search-instantsearch-adapter
# or
pnpm install @elasticpath/catalog-search-instantsearch-adapter
# or
yarn add @elasticpath/catalog-search-instantsearch-adapter
```

## Basic Usage

```javascript
import instantsearch from 'instantsearch.js';
import CatalogSearchInstantSearchAdapter from '@elasticpath/catalog-search-instantsearch-adapter';
import { client } from '@epcc-sdk/sdks-shopper';

// Configure your Elastic Path shopper client
client.setConfig({
  baseUrl: 'https://euwest.api.elasticpath.com',
  headers: {
    Authorization: 'Bearer YOUR_AUTH_TOKEN',
  },
});

// Create the adapter
const searchAdapter = new CatalogSearchInstantSearchAdapter({
  client: client,
});

// Initialize InstantSearch with the adapter
const search = instantsearch({
  indexName: 'search',
  searchClient: searchAdapter.searchClient,
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
    attribute: 'brand',
  }),
]);

search.start();
```

## Index Name Configuration

When using this adapter, the `indexName` parameter in InstantSearch configuration has special significance:

- **For regular search**: Use `indexName: 'search'`
- **For autocomplete**: Use `indexName: 'autocomplete'` (when using with autocomplete.js)

The adapter maps the `indexName` to the `type` parameter in Elastic Path's Catalog Search API requests. These are the only supported values that correspond to Elastic Path's search endpoints.

