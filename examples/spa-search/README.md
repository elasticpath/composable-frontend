# Catalog Search (React SPA with Vite)

This example shows how to search an Elastic Path catalog from a single-page app built with React and Vite. A search box sends the shopper's text to Catalog Search through the shopper SDK, and the matching products show as a grid of cards with name and SKU.

It uses no search UI library. For faceted navigation, autocomplete and pagination, see [spa-search-instantsearch](../spa-search-instantsearch).

## Overview

This example shows:

- How to authenticate a storefront with an implicit token that the SDK stores in browser local storage.
- How to call Catalog Search with `postMultiSearch` from `@epcc-sdk/sdks-shopper`.
- How to read the products in a search result: each hit's `document` is a catalog product, typed as `CatalogSearchProduct`.
- How to search for `*` to list the whole catalog when the shopper has not typed a query.

## How search works

`src/App.tsx` holds the query in state and runs a search whenever it changes:

```typescript
const response = await postMultiSearch({
  body: {
    searches: [{ type: "search", q: query }],
  },
})
setSearchResults(response.data?.results?.[0] || null)
```

`postMultiSearch` takes a list of searches. This example sends one, so it reads the first entry of `results`. The page starts with the query `*`, and submitting the form replaces the query with the text in the box.

## Authentication

`src/auth/StorefrontProvider.tsx` configures the SDK client with the endpoint URL and the client ID, and sets `storage: "localStorage"`. The SDK then requests an implicit token when it needs one, keeps it in local storage, and attaches it to every request. A token kept in local storage can be read by any script on the page, so adapt this approach before using it in production. See [spa-authentication](../spa-authentication) for the authentication flow on its own, and its security warning.

## Project Structure

- `src/App.tsx`: the search box and the results grid.
- `src/auth/StorefrontProvider.tsx`: configures the SDK client and its authentication.
- `src/constants.ts`: the endpoint URL from the Vite environment.
- `src/main.tsx`: entry point, wraps `App` with `StorefrontProvider`.

## Getting Started

### Environment Variables

Create a `.env` file in `examples/spa-search`:

```bash
VITE_APP_EPCC_ENDPOINT_URL=your_endpoint_url # e.g. https://useast.api.elasticpath.com
VITE_APP_EPCC_CLIENT_ID=your_client_id
```

### Installation and development

```bash
pnpm install
pnpm dev
```

Open the URL that Vite prints, usually [http://localhost:5173](http://localhost:5173).

### Building for Production

```bash
pnpm build
```
