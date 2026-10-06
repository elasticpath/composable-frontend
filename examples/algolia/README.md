# Algolia search storefront

A Next.js storefront whose product search runs on Algolia. The search page reads an Algolia index of Elastic Path catalog data, using the `ep_` attributes for price, slug and category hierarchy. It offers faceted filtering by category, price range and colour, and sits inside a storefront with product pages, cart and checkout.

This project was generated with [Composable CLI](https://www.npmjs.com/package/composable-cli).

## Store Setup Requirements

Nothing in this repository provisions the store for this example. Set up each item in Commerce Manager or through the Elastic Path APIs.

### Required

- **An application key with a client ID, and a cookie prefix.** `src/lib/resolve-epcc-env.ts` throws at import time without `NEXT_PUBLIC_EPCC_CLIENT_ID`, and `src/lib/resolve-cart-env.ts` throws without `NEXT_PUBLIC_COOKIE_PREFIX_KEY`, so the app does not build or start without them. `src/lib/middleware/implicit-auth-middleware.ts` requests an implicit access token with the client ID and keeps it in a `<prefix>_ep_credentials` cookie. Create an application key in Commerce Manager and copy its client ID. The prefix is any string you choose, for example `_store`.
- **A published catalog with priced products in `NEXT_PUBLIC_DEFAULT_CURRENCY_CODE`.** The product page (`getProductById` in `src/services/products.ts`) and the featured products read the shopper catalog, and search hits link to `/products/<objectID>`. The clients send the currency (`USD` unless you set the variable) with every request, so products need a price in that currency. Publish a catalog in Commerce Manager.
- **An Algolia index of the catalog.** `src/lib/resolve-algolia-env.ts` throws at import time without `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_API_KEY` and `NEXT_PUBLIC_ALGOLIA_INDEX_NAME`. The search page queries that index. Each record needs the Elastic Path product ID as its `objectID`, because hits link to `/products/<objectID>`, and these attributes: `ep_name`, `ep_description`, `ep_main_image_url`, `ep_price.<currency>.float_price` and `formatted_price` (plus `sale_prices` for a sale price), and `ep_slug_categories.lvl0` to `lvl3` for the category hierarchy (`src/components/search/Hit.tsx`, `src/lib/hierarchical-attributes.ts`, `src/lib/search-constants.ts`). The Elastic Path Algolia integration publishes catalog data in that shape. The Composable CLI command `ep int algolia` configures it. The API key is read in the browser, so use a search-only key.
- **The manual payment gateway enabled.** `usePaymentComplete.tsx` converts the cart to an order and pays it with `gateway: "manual"` (`src/app/(checkout)/checkout/usePaymentComplete.tsx`). Enable the Manual gateway in Commerce Manager under payment settings.

### Optional

- **A hierarchy with nodes in the catalog.** `buildSiteNavigation` (`src/lib/build-site-navigation.ts`) builds the header menu from the first four hierarchies and their child nodes, and `NodeMenu.tsx` renders the same tree above the filters. Without hierarchies the menu has no entries, the Category heading above the node menu is hidden, and the search page still lists whatever the index returns. Create hierarchies and nodes in Commerce Manager and include them in the catalog.
- **Replica indices for price sorting.** `src/lib/sort-by-items.ts` offers Featured (the index itself), `<index>_price_asc` and `<index>_price_desc`. Create the two replicas in Algolia, sorted by `ep_price.<currency>.float_price`. Without them the sort menu still lists the options, and choosing one queries an index that does not exist.
- **Brand, colour and on-sale attributes.** `ProductSpecification.tsx` refines on `ep_extensions_products_specifications.brand`, `.color` and `.on-sale`. Get these fields into the index under exactly those names. Without them the refinements render with no options.
- **Account sign-in, registration and password change.** `NEXT_PUBLIC_PASSWORD_PROFILE_ID` is the ID of a password profile on an authentication realm, used by sign-in and registration (`src/app/(auth)/actions.ts`). Changing the password on the account summary page also needs `NEXT_PUBLIC_AUTHENTICATION_REALM_ID` and `EPCC_CLIENT_SECRET`, because `src/app/(store)/account/summary/actions.ts` looks up the member's password profile entry with a `client_credentials` client. Without the profile ID, sign-in and registration fail. Without the realm ID or the secret, the password change fails. Browsing, the cart and guest checkout work without any of them. Create a password profile in Commerce Manager and copy its ID, and the ID of its authentication realm. Elastic Path store keys are not scoped to endpoints, so the key behind `EPCC_CLIENT_SECRET` can do more than the example needs. Keep it on the server.

## Environment variables

Set these in `.env.local` or in your host's environment settings. The repository has no `.env.example` for this example. `NEXT_PUBLIC_` variables are inlined at build time, so rebuild after changing one. A variable marked Yes below makes the build or the first request fail when it is missing.

| Variable | Needed | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_EPCC_CLIENT_ID` | Yes | Client ID of an application key (`src/lib/resolve-epcc-env.ts`). |
| `NEXT_PUBLIC_EPCC_ENDPOINT_URL` | Yes | The API host without a scheme, for example `useast.api.elasticpath.com`. The SDK takes it as `host` and the middleware builds `https://<value>/...` from it, so a value that starts with `https://` produces a broken URL. |
| `NEXT_PUBLIC_COOKIE_PREFIX_KEY` | Yes | Prefix of the cookie names (`<prefix>_ep_credentials`, `<prefix>_ep_cart`, `<prefix>_ep_account_member_token`). |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | Yes | Algolia application ID. |
| `NEXT_PUBLIC_ALGOLIA_API_KEY` | Yes | Algolia search-only API key. It reaches the browser. |
| `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` | Yes | Name of the index. The sort options also expect `<name>_price_asc` and `<name>_price_desc`. |
| `NEXT_PUBLIC_PASSWORD_PROFILE_ID` | For sign-in | ID of the password profile used for sign-in and registration. |
| `NEXT_PUBLIC_AUTHENTICATION_REALM_ID` | For password change | ID of the authentication realm that holds the password profile. |
| `EPCC_CLIENT_SECRET` | For password change | Client secret of the application key. Server only: it has no `NEXT_PUBLIC_` prefix and must stay out of browser code. |
| `NEXT_PUBLIC_DEFAULT_CURRENCY_CODE` | No | Currency code sent with every request and used to read prices. Defaults to `USD`. A `<prefix>_ep_currency` cookie, if present, overrides it. |
| `NEXT_PUBLIC_CONTEXT_TAG` | No | Sent as the `EP-Context-Tag` header on every SDK request when set. |
| `NEXT_PUBLIC_CHANNEL` | No | Sent as the `EP-Channel` header on every SDK request when set. |
| `SITE_NAME` | No | Site name used in the page titles and in the logo's accessible label. It has no `NEXT_PUBLIC_` prefix, so the browser bundle does not see it. |
| `NEXT_PUBLIC_VERCEL_URL` | No | Set by Vercel. The deployment host without a scheme, used as `metadataBase`. Defaults to `http://localhost:3000`. |

## Tech Stack

- [Elastic Path](https://www.elasticpath.com/products): A family of composable products for businesses that need to quickly & easily create unique experiences and next-level customer engagements that drive revenue.

- [Next.js](https://nextjs.org/): a React framework for building static and server-side rendered applications

- [Tailwind CSS](https://tailwindcss.com/): enabling you to get started with a range of out the box components that are
  easy to customize

- [Headless UI](https://headlessui.com/): completely unstyled, fully accessible UI components, designed to integrate
  beautifully with Tailwind CSS.

- [Radix UI Primitives](https://www.radix-ui.com/primitives): Unstyled, accessible, open source React primitives for high-quality web apps and design systems.

- [Typescript](https://www.typescriptlang.org/): a typed superset of JavaScript that compiles to plain JavaScript

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page will hot reload as you edit the file.

## Deployment

Deployment is typical for a Next.js site. We recommend using a provider
like [Netlify](https://www.netlify.com/blog/2020/11/30/how-to-deploy-next.js-sites-to-netlify/)
or [Vercel](https://vercel.com/docs/frameworks/nextjs) to get full Next.js feature support.

## Current feature set reference

| **Feature**                              | **Notes**                                                                                     |
|------------------------------------------|-----------------------------------------------------------------------------------------------|
| PDP                                      | Product Display Pages                                                                         |
| PLP                                      | Product Listing Pages.                                                                        |
| EPCC PXM product variations              | [Learn more](https://elasticpath.dev/docs/pxm/products/pxm-product-variations/pxm-variations) |
| EPCC PXM bundles                         | [Learn more](https://elasticpath.dev/docs/pxm/products/pxm-bundles/pxm-bundles)               |
| EPCC PXM hierarchy-based navigation menu | Main site nav driven directly from your store's hierarchy and node structure                  |
| Prebuilt helper components               | Some basic building blocks for typical ecommerce store features                               |
| Checkout                                 | [Learn more](https://elasticpath.dev/docs/commerce-cloud/checkout/checkout-workflow)          |
| Cart                                     | [Learn more](https://elasticpath.dev/docs/commerce-cloud/carts/carts)                         |

