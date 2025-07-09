# List Products Example

This example demonstrates how to implement basic product listing and detail functionality using Elastic Path Commerce Cloud. It shows the fundamental patterns for displaying products from your catalog in a Next.js application.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Flist-products&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL&project-name=ep-list-products-example)

## Overview

This example shows:

- How to fetch and display a list of products from Elastic Path
- How to show product details including images, pricing, and stock information
- How to implement basic product navigation (list → detail view)
- How to handle product metadata like SEO information
- Basic authentication flow required for Elastic Path API access

## Features

### Product Listing
- Displays products in a responsive grid layout
- Shows product images, names, and descriptions
- Includes authentication status indicator
- Handles empty state when no products are available

### Product Details
- Individual product pages with detailed information
- Displays product images, descriptions, SKUs, pricing, and stock levels
- Implements proper SEO metadata (title, description, Open Graph, Twitter cards)
- Includes structured data (JSON-LD) for search engines
- Navigation back to product listing

## How the SDK is Used

The example uses the `@epcc-sdk/sdks-shopper` package to:

1. **Fetch product listings**: Using `getByContextAllProducts` to retrieve all products with main images
2. **Fetch individual products**: Using `getByContextProduct` to get detailed product information
3. **Extract product images**: Using `extractProductImage` helper to get main product images
4. **Handle authentication**: Basic server-side authentication for API access (see other examples for detailed auth patterns)

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
