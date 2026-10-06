# Elastic Path Catalog Search with InstantSearch.js Example

This example demonstrates how to integrate Elastic Path's catalog search functionality with Algolia's InstantSearch.js library using the Elastic Path InstantSearch adapter. It showcases building a powerful search experience with faceted navigation, autocomplete, and real-time search results.

## Overview

This React SPA (Vite-based) example demonstrates:

- Integration of Elastic Path Catalog Search with InstantSearch.js components
- Faceted search with hierarchical categories, brand filtering, and price ranges
- Autocomplete functionality with search suggestions and recent searches
- Real-time search results with pagination
- Responsive search UI using InstantSearch components
- Using the `@elasticpath/catalog-search-instantsearch-adapter` to connect Elastic Path's search API to InstantSearch

## Key Features

### Search Components

The example implements several InstantSearch components:

- **Autocomplete**: Search box with query suggestions and recent searches
- **Hierarchical Menu**: Category navigation with nested categories
- **Refinement Lists**: Brand filtering with facet counts
- **Range Slider**: Price filtering with custom slider component
- **Hits**: Product search results with custom hit component
- **Pagination**: Navigate through search results
- **Breadcrumb**: Shows current category path

### Elastic Path InstantSearch Adapter

The adapter (`@elasticpath/catalog-search-instantsearch-adapter`) bridges Elastic Path's search API with InstantSearch's expected format:

```typescript
const catalogSearchInstantSearchAdapter = new CatalogSearchInstantSearchAdapter({
  client: client, // Elastic Path SDK client
  additionalSearchParameters: {
    // Additional search parameters can be configured here
  },
})
const searchClient = catalogSearchInstantSearchAdapter.searchClient
```

## Project Structure

- `src/App.tsx`: Main search interface with InstantSearch components
- `src/Autocomplete.tsx`: Custom autocomplete implementation with suggestions
- `src/Hit.tsx`: Product hit component for displaying search results
- `src/Panel.tsx`: Reusable panel component for facets
- `src/RangeSlider.tsx`: Custom price range slider using Radix UI
- `src/auth/StorefrontProvider.tsx`: Authentication setup (inherited from other examples)
- `src/constants.ts`: Configuration including hierarchical attribute mapping

## Store Setup Requirements

### Required

- **An application key (client ID) for implicit authentication.** `src/auth/StorefrontProvider.tsx` configures the SDK with it and throws at load if it is missing. Create the key in Commerce Manager (Application Keys) and copy its client ID.
- **Catalog Search enabled for the store, with a published catalog indexed.** Every search goes through the adapter in `src/App.tsx`. The adapter throws when the search response carries an error and the example shows no error message, so with Catalog Search off the result list stays empty.
- **Prices on every product, in GBP.** `src/Hit.tsx` renders `hit.meta.display_price.with_tax.formatted` without a null check, so a hit with no `display_price` throws during render and the page goes blank. The price slider in `src/App.tsx` is bound to `price.GBP.float_price`, so the store needs a GBP currency and a GBP price on the products. Without that field the slider has no range and stays disabled (`src/RangeSlider.tsx`). To use another currency, change that attribute.
- **Products in a category hierarchy.** `src/constants.ts` lists the hierarchical facet fields `categories.lvl0` to `categories.lvl4`. `HierarchicalMenu` and `Breadcrumb` in `src/App.tsx` and the autocomplete in `src/Autocomplete.tsx` read them, so the products need hierarchy nodes in the published catalog for the index to hold category paths.

### Optional

- **A `BRAND-NAME` field on a `Details` Product Experience Manager template, made facetable.** `src/App.tsx` builds the Brands facet from `extensions.Details.BRAND-NAME`, and `src/Hit.tsx` reads the value from `attributes.extensions["products(Details)"]["BRAND-NAME"]`. Create the template and field in Commerce Manager, attach the template to your products, and fill in a brand. A product without a brand shows "By" with nothing after it. If the field is not facetable, what the Brands panel shows is unclear.
- **Autocomplete query suggestions.** `src/Autocomplete.tsx` sends a Catalog Search request of type `autocomplete` and reads each suggestion's `q` field. Recent searches come from browser local storage and need nothing from the store. When the store returns no suggestions, the autocomplete shows "No results found.". If the request itself fails, the example throws inside the autocomplete, and what the shopper sees is unclear.

## Getting Started

### Prerequisites

- Node.js and pnpm (required package manager for this monorepo)

### Environment Variables

Create a `.env` file in the example directory with these variables:

```bash
VITE_APP_EPCC_ENDPOINT_URL=https://useast.api.elasticpath.com
VITE_APP_EPCC_CLIENT_ID=your_client_id
```

- `VITE_APP_EPCC_ENDPOINT_URL` (required): the API host for your store's region, including `https://`. The SDK uses it as the base URL for every request, so a bare host without the scheme is fetched as a relative URL and fails. The app throws "Missing storefront endpoint URL" at load when it is unset.
- `VITE_APP_EPCC_CLIENT_ID` (required): the client ID of the application key described above. The app throws "Missing storefront client id" at load when it is unset.

Vite inlines `VITE_` variables at build time. Restart the dev server or rebuild after you change them.

### Installation

Navigate to the example directory and install dependencies:

```bash
cd examples/spa-search-instantsearch
pnpm install
```

### Development

To run the development server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the search interface.

### Key Implementation Details

#### Search Client Configuration

The example uses the Elastic Path InstantSearch adapter to connect to your catalog:

```typescript
import CatalogSearchInstantSearchAdapter from "@elasticpath/catalog-search-instantsearch-adapter"
import { client } from "@epcc-sdk/sdks-shopper"

const catalogSearchInstantSearchAdapter = new CatalogSearchInstantSearchAdapter({
  client: client,
  additionalSearchParameters: {
    // Configure search parameters here
  },
})
```

#### Hierarchical Categories

Categories are configured for hierarchical navigation:

```typescript
// src/constants.ts
export const INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES = [
  "extensions.products(categories).slug_path.lvl0",
  "extensions.products(categories).slug_path.lvl1",
  "extensions.products(categories).slug_path.lvl2",
  // ... additional levels as needed
]
```

#### Custom Components

- **Hit Component**: Displays individual product results with image, name, price, and description
- **Autocomplete**: Implements search-as-you-type with recent searches and query suggestions
- **Range Slider**: Custom price filter using Radix UI components

### Building for Production

To build the SPA for production:

```bash
pnpm build
```

This creates a `dist` folder with production-ready assets.

## Authentication

This example includes authentication setup using the `StorefrontProvider`, which handles:
- Automatic token generation using implicit grant
- Token storage in local storage
- Automatic token refresh via SDK interceptors

Note: While authentication is implemented, it's not the focus of this example. For detailed authentication patterns, refer to the authentication-specific examples.

## Learn More

- [Elastic Path Catalog Search Documentation](https://documentation.elasticpath.com/commerce-cloud/docs/developer/how-to/search-catalog.html)
- [InstantSearch.js Documentation](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/)
- [Elastic Path Composable Frontend](https://github.com/elasticpath/composable-frontend)
- [React InstantSearch Components](https://www.algolia.com/doc/api-reference/widgets/react/)
