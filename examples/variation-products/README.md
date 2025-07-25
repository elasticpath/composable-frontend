# Product Variations and Bundles Example

Product listing and detail pages with **product variations**, **bundle products**, and **multi-location inventory** using Elastic Path Commerce Cloud. Shows how to implement all product types (standard, parent/child variations, and bundles) with real-time inventory tracking in Next.js.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Fvariation-products&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL&project-name=ep-variation-products-example)

## Overview

This example shows:

- How to fetch and display all product types: **standard**, **variations** (parent/child), and **bundles**
- How to implement interactive variation selectors for size, color, material, etc.
- How to display bundle products with component selection using checkboxes
- How to display price ranges for products with multiple variations
- How to show variation-specific and bundle-specific inventory across multiple locations
- How to handle variation-specific SKUs and pricing
- How to use **Multi-Location Inventory (MLI)** with all product types
- How to validate bundle component selections (min/max constraints)
- Basic authentication flow required for Elastic Path API access

## Features

### Product Listing
- Displays products in a responsive grid layout
- Shows product images, names, and descriptions
- Handles empty state when no products are available

### Product Details
- Individual product pages at `/products/[id]` with detailed information
- **Interactive variation selector** for choosing size, color, etc.
- **Dynamic price updates** based on selected variation
- **Variation-specific SKUs** displayed when variation is selected
- **Multi-location inventory** per variation with location-specific stock levels
- **B2B-optimized stock display** showing exact quantities available
- Implements proper SEO metadata (title, description, Open Graph, Twitter cards)
- Includes structured data (JSON-LD) for search engines with variation pricing
- Navigation back to product listing

### Product Variations Features
- **Variation Options** dynamically extracted from product data (size, color, material, etc.)
- **Smart Matching** finds the correct variation based on selected options
- **Variation Cards** show count badges on product listings
- **Fallback Handling** for products without variations

## How the SDK is Used

The example uses the `@epcc-sdk/sdks-shopper` package to:

1. **Fetch product listings**: Using `getByContextAllProducts` with `include: ["main_image", "component_products"]`
2. **Fetch products with variations**: Using `getByContextProduct` with main_image and files included
3. **Extract product images**: Using `extractProductImage` helper to get main product images
4. **Handle variations**: Component products represent different variations of a base product
5. **Fetch inventory locations**: Using `listLocations` to get all warehouse/store locations
6. **Fetch variation inventory**: Using `getStock` with variation product IDs
7. **Handle authentication**: Server-side authentication with multi-location inventory header support

### Product Type Handling

The product detail page intelligently handles all Elastic Path product types:

- **Standard Products**: Products without variations or bundles, displayed with `DisplayStandardProduct`
- **Parent Products**: Products with variations, displayed with `DisplayVariationProduct`
- **Child Products**: Variation instances that fetch their parent data and display with `DisplayVariationProduct`
- **Bundle Products**: Products with selectable components, displayed with `DisplayBundleProduct`

The page automatically detects the product type using `meta.product_types[0]` and renders the appropriate component wrapped in context providers.

### Product Variations Implementation

The example demonstrates variation handling by:

- **Fetching variations**: Including `component_products` in API calls
- **Option extraction**: Dynamically building option lists from variation data
- **Variation matching**: Finding correct variation based on selected options
- **Price calculation**: Computing min/max prices from all variations
- **Inventory updates**: Fetching stock for specific variations

### Bundle Products Implementation

The example demonstrates bundle handling by:

- **Fetching bundles**: Including `component_products` in API calls to get bundle components
- **Component display**: Showing bundle components as selectable options with images
- **Checkbox selection**: Using checkboxes to select bundle components
- **Validation**: Enforcing min/max selection constraints per component
- **Form handling**: Using React Hook Form with Zod validation schemas
- **Cart integration**: Adding bundles with selected components to cart

### Key Functions and Components

```typescript
// Fetch product with images and components
const response = await getByContextProduct({
  path: { product_id: productId },
  query: { 
    include: ["main_image", "files", "component_products"] 
  }
})

// Detect product type and handle accordingly
switch (productData.data?.meta?.product_types?.[0]) {
  case "standard":
    // Render standard product without variations
    break
  case "child":
    // Fetch parent product for variation context
    const parentResponse = await fetchProduct({
      productId: productData.data?.attributes?.base_product_id!
    })
    break
  case "parent":
    // Render parent product with variation selector
    break
  case "bundle":
    // Fetch component images for bundle products
    const componentProducts = productData.included?.component_products
    const componentImageFiles = await fetchComponentImages(componentProducts)
    break
}

// Wrap components with context providers
<LocationSelectorProvider initialLocations={locations}>
  <BundleProductProvider product={productData} componentImageFiles={componentImageFiles}>
    <DisplayBundleProduct />
  </BundleProductProvider>
</LocationSelectorProvider>
```

### New Components

#### Variation Components
- **VariationSelector**: Interactive UI for selecting product options
- **VariationPrice**: Dynamic price display with range support
- **VariationInventory**: Stock levels for selected variation
- **ProductVariationCard**: Enhanced product card with variation indicators

#### Bundle Components
- **BundleProductProvider**: Context provider for bundle product data
- **BundleProductContent**: Main display component for bundle products
- **ProductComponent**: Individual bundle component with checkbox selection
- **ProductComponents**: Container that renders all bundle components
- **BundleProductForm**: Form wrapper with validation and submission

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

Open [http://localhost:3004](http://localhost:3004) with your browser to see the result.

## Product Variation Structure

In Elastic Path, product variations are implemented as:

- **Base Product**: The parent product with general information
- **Component Products**: Child products representing specific variations
- **Variation Attributes**: Options like size, color stored on each variation

### Example Data Structure

```json
{
  "id": "base-product-id",
  "type": "product",
  "attributes": {
    "name": "Classic T-Shirt",
    "sku": "TSHIRT-BASE"
  },
  "relationships": {
    "component_products": {
      "data": [
        { "id": "variation-1", "type": "product" },
        { "id": "variation-2", "type": "product" }
      ]
    }
  }
}
```

Each variation has its own:
- SKU
- Price
- Inventory levels
- Variation attributes (stored in `attributes.variations`)

## Customization

### Adding New Variation Types
1. Configure variations in Elastic Path Commerce Manager
2. The VariationSelector automatically detects new options
3. Customize display in `VariationSelector.tsx`

### Styling
- Modify variation buttons in `VariationSelector.tsx`
- Customize price ranges in `VariationPrice.tsx`
- Update variation badges in `ProductVariationCard.tsx`

## Learn More

For more information about Elastic Path Commerce Cloud:

- [Elastic Path Documentation](https://documentation.elasticpath.com/)
- [Product Variations Guide](https://documentation.elasticpath.com/commerce-cloud/docs/api/catalog/products/create-variation.html)
- [Multi-Location Inventory](https://documentation.elasticpath.com/commerce-cloud/docs/api/inventory/multi-location-inventories.html)
- [Elastic Path Composable Frontend SDK](https://github.com/elasticpath/composable-frontend)
