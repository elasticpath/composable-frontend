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