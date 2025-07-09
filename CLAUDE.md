# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager**: pnpm (required, see package.json engines)

**Common Commands**:
- `pnpm install` - Install dependencies
- `pnpm generate` - Generate types for schematic schemas (run during development)
- `pnpm build` - Build all apps and packages
- `pnpm dev` - Start all development servers in parallel
- `pnpm lint` - Run linting across all packages
- `pnpm test` - Run tests across all packages
- `pnpm test:watch` - Run tests in watch mode
- `pnpm format` - Format code with Prettier

**Package-specific Commands**:
- `pnpm test:packages` - Run tests only for packages
- `pnpm build:packages` - Build only packages
- `pnpm build:cli` - Build CLI specifically

**E2E Testing**:
- `pnpm start:e2e` - Start e2e environment (simple example)
- `pnpm test:e2e` - Run e2e tests (simple example)
- `pnpm build:e2e` - Build for e2e testing

## Architecture

**Monorepo Structure**: This is a Turborepo-based monorepo using pnpm workspaces with the following main sections:

- `packages/` - Core packages and SDKs
- `examples/` - Example storefronts and implementations
- `apps/` - Applications (CLI docs)

**Key Packages**:
- `composable-cli` - CLI tool for generating storefronts (`ep generate`)
- `d2c-schematics` - Angular schematics for code generation
- `react-shopper-hooks` - React hooks for shopper functionality
- `composable-common` - Shared utilities and types
- `sdks/` - TypeScript SDKs for various Elastic Path Commerce APIs

**Examples Structure**:
- `simple/` - Basic storefront implementation
- `commerce-essentials/` - Full-featured storefront
- `list-products/` - Product listing with multi-location inventory
- `algolia/` - Algolia search integration
- `payments/` - Payment gateway examples
- `memberships/` - Account membership features

**Technology Stack**:
- Next.js for storefronts
- TypeScript throughout
- Tailwind CSS for styling
- Turbo for monorepo management
- Playwright for E2E testing

**Code Generation**: The CLI generates storefronts using Angular schematics. Run `pnpm generate` to update generated TypeScript types from schema files.

**Build System**: Uses Turborepo with dependency-aware building. Each package defines its own build process in individual package.json files.

## Integration Points

**Elastic Path Commerce**: All examples connect to Elastic Path Commerce APIs using the generated SDKs in `packages/sdks/`.

**Authentication**: Multiple authentication patterns available - see examples for local storage, server cookies, and shopper accounts.

**Search Integration**: Algolia and Klevu integrations available with corresponding example implementations.

**Payment Processing**: Stripe and manual payment gateway examples included.

**Multi-Location Inventory**: The `list-products` example demonstrates comprehensive multi-location inventory management using Elastic Path's Multi-Location Inventory (MLI) feature.

## Multi-Location Inventory Implementation

**Purpose**: The `examples/list-products` example was enhanced to demonstrate real-time, location-specific inventory management for B2B commerce scenarios.

**Key Features**:
- **Real-time inventory data** via `getStock()` API calls with `EP-Inventories-Multi-Location: true` header
- **Location selection** allowing users to view stock levels for specific warehouses/stores
- **B2B-optimized display** showing exact stock numbers (available, allocated, total)
- **Smart defaults** automatically selecting locations with available stock
- **Graceful fallbacks** handling missing locations or stock data
- **SEO integration** with proper structured data for inventory status

**Implementation Details**:
- **Server-side inventory fetching** using `fetchInventoryLocations()` and `fetchProductStock()`
- **Standalone components**: `LocationSelector` and `MultiLocationInventory`
- **SDK type reuse** leveraging existing `Location` and `StockResponse` types
- **Product details only** (not shown in product listing for performance)
- **Error handling** for API failures, missing data, and edge cases

**Architecture**:
- `src/lib/inventory.ts` - Utility functions for inventory data fetching and processing
- `src/app/components/LocationSelector.tsx` - Location dropdown component
- `src/app/components/MultiLocationInventory.tsx` - Complete inventory display with location selection
- SDK interceptors configured to include MLI header on all requests

**Why This Feature**: Enables B2B customers to see accurate, location-specific inventory levels for informed purchasing decisions across multiple warehouses or distribution centers.