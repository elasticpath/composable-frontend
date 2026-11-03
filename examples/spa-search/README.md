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

## Store Setup Requirements

### Required

- **An application key (client ID) for implicit authentication.** `src/auth/StorefrontProvider.tsx` configures the SDK with it and throws at load if it is missing. Create the key in Commerce Manager (Application Keys) and copy its client ID.
- **Catalog Search enabled for the store, with a published catalog indexed.** `src/App.tsx` calls `postMultiSearch` with one search of type `search`. The example needs no prices, facets, hierarchy or other store features, but each product's search document should carry `attributes.name` and `attributes.sku`, which the cards display. A real search with no matches shows "No products found." If Catalog Search is off or the call fails, the example does not read the SDK `error`, so it shows an empty grid with no message.

### Optional

None. The example uses no other store feature.

## Getting Started

### Environment Variables

Create a `.env` file in `examples/spa-search`:

```bash
VITE_APP_EPCC_ENDPOINT_URL=https://useast.api.elasticpath.com
VITE_APP_EPCC_CLIENT_ID=your_client_id
```

- `VITE_APP_EPCC_ENDPOINT_URL` (required): the API host for your store's region, including `https://`. The SDK uses it as the base URL for every request, so a bare host without the scheme is fetched as a relative URL and fails. The app throws "Missing storefront endpoint URL" at load when it is unset.
- `VITE_APP_EPCC_CLIENT_ID` (required): the client ID of the application key described above. The app throws "Missing storefront client id" at load when it is unset.

Vite inlines `VITE_` variables at build time. Restart the dev server or rebuild after you change them.

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
