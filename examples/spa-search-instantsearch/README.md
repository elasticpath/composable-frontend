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
const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  client: client, // Elastic Path SDK client
  additionalSearchParameters: {
    // Additional search parameters can be configured here
  },
})
const searchClient = typesenseInstantsearchAdapter.searchClient
```

## Project Structure

- `src/App.tsx`: Main search interface with InstantSearch components
- `src/Autocomplete.tsx`: Custom autocomplete implementation with suggestions
- `src/Hit.tsx`: Product hit component for displaying search results
- `src/Panel.tsx`: Reusable panel component for facets
- `src/RangeSlider.tsx`: Custom price range slider using Radix UI
- `src/auth/StorefrontProvider.tsx`: Authentication setup (inherited from other examples)
- `src/constants.ts`: Configuration including hierarchical attribute mapping

## Getting Started

### Prerequisites

- An Elastic Path Commerce Cloud account with Catalog Search enabled
- A client ID for your storefront application
- Node.js and pnpm (required package manager for this monorepo)

### Environment Variables

1. Copy the `.env.example` file to `.env` in the example directory:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Elastic Path credentials:
   ```bash
   VITE_APP_EPCC_ENDPOINT_URL=your_endpoint_url # e.g. https://useast.api.elasticpath.com
   VITE_APP_EPCC_CLIENT_ID=your_client_id
   ```

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
import TypesenseInstantSearchAdapter from "@elasticpath/catalog-search-instantsearch-adapter"
import { client } from "@epcc-sdk/sdks-shopper"

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
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
