# List Products Example

Product listing and detail pages with **multi-location inventory** using Elastic Path Commerce Cloud. Shows real-time inventory tracking across multiple locations in Next.js.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Flist-products&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL&project-name=ep-list-products-example)

## Overview

This example shows:

- How to fetch and display a list of products from Elastic Path
- How to show product details including images, pricing, and **multi-location inventory**
- How to implement basic product navigation (list → detail view)
- How to handle product metadata like SEO information
- How to use **Multi-Location Inventory (MLI)** for B2B scenarios
- Basic authentication flow required for Elastic Path API access

## Features

### Product Listing
- Displays products in a responsive grid layout
- Shows product images, names, and descriptions
- Includes authentication status indicator
- Handles empty state when no products are available

### Product Details
- Individual product pages with detailed information
- Displays product images, descriptions, SKUs, pricing, and **real-time inventory**
- **Multi-location inventory selection** with location-specific stock levels
- **B2B-optimized stock display** showing exact quantities available
- Implements proper SEO metadata (title, description, Open Graph, Twitter cards)
- Includes structured data (JSON-LD) for search engines with live inventory status
- Navigation back to product listing

### Multi-Location Inventory Features
- **Real-time inventory data** fetched from Elastic Path's Multi-Location Inventory API
- **Location selector** allowing users to choose warehouse/store locations
- **Smart defaults** automatically selecting locations with available stock
- **Graceful fallbacks** for missing locations or inventory data
- **B2B-focused display** showing available quantities (not just in-stock/out-of-stock)
- **Performance optimized** with parallel API calls and server-side rendering

## How the SDK is Used

The example uses the `@epcc-sdk/sdks-shopper` package to:

1. **Fetch product listings**: Using `getByContextAllProducts` to retrieve all products with main images
2. **Fetch individual products**: Using `getByContextProduct` to get detailed product information
3. **Extract product images**: Using `extractProductImage` helper to get main product images
4. **Fetch inventory locations**: Using `listLocations` to get all warehouse/store locations
5. **Fetch live inventory**: Using `getStock` to get real-time stock levels with location breakdown
6. **Handle authentication**: Server-side authentication with multi-location inventory header support

### Multi-Location Inventory Implementation

The example demonstrates advanced inventory management by:

- **Configuring MLI header**: Adding `EP-Inventories-Multi-Location: true` to all API requests
- **Parallel data fetching**: Using `Promise.all` to fetch locations and stock simultaneously
- **Location-specific stock**: Displaying inventory levels for specific warehouses/stores
- **Smart defaulting**: Automatically selecting locations with available stock
- **Error handling**: Graceful fallbacks when inventory data is unavailable

### Key SDK Functions Used

```typescript
// Fetch all inventory locations
const locations = await listLocations({})

// Fetch stock for a specific product (with location breakdown)
const stock = await getStock({ 
  path: { product_uuid: "product-id" } 
})

// SDK client automatically includes MLI header when configured
```

## Getting Started

### Prerequisites

- An Elastic Path Commerce Cloud account
- A client ID for your storefront application

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
NEXT_PUBLIC_EPCC_CLIENT_ID=your_client_id
NEXT_PUBLIC_EPCC_ENDPOINT_URL=your_endpoint_url # e.g. https://euwest.api.elasticpath.com
```

### Installation

```bash
npm install
# or
yarn
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

For more information about Elastic Path Commerce Cloud:

- [Elastic Path Documentation](https://documentation.elasticpath.com/)
- [Authentication with Elastic Path](https://documentation.elasticpath.com/commerce-cloud/docs/api/basics/authentication/index.html)
- [Elastic Path Composable Frontend SDK](https://github.com/elasticpath/composable-frontend)
