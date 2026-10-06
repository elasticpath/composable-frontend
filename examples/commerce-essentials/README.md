# Commerce Essentials storefront

A Next.js storefront built on the Elastic Path JavaScript SDK and `@elasticpath/react-shopper-hooks`. It adds Klevu search and product recommendations, checkout with Elastic Path Payments powered by Stripe, PDF product files, and password reset with a one-time password token, to the product, cart and account pages of a typical storefront.

This project was generated with [Composable CLI](https://www.npmjs.com/package/composable-cli).

## Store Setup Requirements

Nothing in this repository provisions the store for this example. Set up each item in Commerce Manager or through the Elastic Path APIs.

### Required

- **An application key with a client ID, and a cookie prefix.** `src/lib/resolve-epcc-env.ts` throws at import time without `NEXT_PUBLIC_EPCC_CLIENT_ID`, and `src/lib/resolve-cart-env.ts` throws without `NEXT_PUBLIC_COOKIE_PREFIX_KEY`, so the app does not build or start without them. `src/lib/middleware/implicit-auth-middleware.ts` requests an implicit access token with the client ID and keeps it in a `<prefix>_ep_credentials` cookie. Create an application key in Commerce Manager and copy its client ID. The prefix is any string you choose, for example `_store`.
- **A published catalog with priced products in `NEXT_PUBLIC_DEFAULT_CURRENCY_CODE`.** The product page (`getProductById` and the slug filter in `src/app/(store)/products/[...productSegment]/page.tsx`) and the featured products read the shopper catalog, and Klevu hits link to `/products/<id>`. The clients send the currency (`USD` unless you set the variable) with every request, so products need a price in that currency. Publish a catalog in Commerce Manager.
- **A Klevu account whose index holds the catalog's products.** `src/lib/klevu.ts` initialises `@klevu/core` with `NEXT_PUBLIC_KLEVU_SEARCH_URL` and `NEXT_PUBLIC_KLEVU_API_KEY`. The search page and the search modal call `search`, and the product page's "You might also like" list calls `similarProducts`, falling back to `trendingProducts`. Each Klevu record's `id` must be the Elastic Path product ID, because hits link to `/products/<id>`. The Category menu is built from Klevu's `category` filter and the price slider from `klevu_price` (`src/components/search/NodeMenu.tsx`, `ProductsProvider.tsx`). When Klevu returns no filters the Category heading and menu are hidden. Create a Klevu account, load your catalog into it, and copy the search URL host and the API key.
- **Elastic Path Payments (powered by Stripe) enabled, with its Stripe account ID and publishable key.** `src/lib/resolve-ep-stripe-env.ts` throws at import time without `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_STRIPE_ACCOUNT_ID`, and `src/app/(checkout)/checkout/usePaymentComplete.tsx` starts the payment with `gateway: "elastic_path_payments_stripe"` and `payment_method_types: ["card"]`, confirms it with the Stripe Payment Element, then confirms it with Elastic Path. Set up Elastic Path Payments in Commerce Manager, or with the Composable CLI command `ep payments ep-payments`. The Stripe account ID is the account that Elastic Path Payments is connected to. Use Stripe test keys for development.

### Optional

- **A shipping rates API.** `src/app/(checkout)/checkout/useShippingMethod.tsx` calls `NEXT_PUBLIC_SHIPPING_API_ENDPOINT?cart_id=<cart id>` with an `Api-Key` header and expects a JSON array of `{ name, slug, price: { amount, formatted } }`. The example does not ship with one. Without it the Shipping Method section stays a placeholder, and `usePaymentComplete.tsx` still adds a Shipping line item, priced at 0, before it creates the order.
- **Files attached to products.** The product page requests the `files` include. `ProductFiles.tsx` lists PDF files under "Reference Material" and other files under "Downloads", and hides each heading when it has no files. Upload files with the Files API or Commerce Manager and attach them to a product. PDF downloads go through `/pdf?url=` (`src/app/(store)/pdf/route.tsx`).
- **Account sign-in, registration, password change and password reset.** `NEXT_PUBLIC_PASSWORD_PROFILE_ID` is the ID of a password profile on an authentication realm, used by sign-in and registration (`src/app/(auth)/actions.ts`). `requestPasswordReset` in the same file creates a one-time password token request on the realm with `NEXT_PUBLIC_AUTHENTICATION_REALM_ID`. The example does not send the email: the store must send the reset link, which `src/app/(auth)/reset-password/page.tsx` expects to carry the query parameters `userAuthenticationInfoId`, `otp`, `username`, `authenticationRealmId`, `userAuthenticationPasswordProfileInfoId` and `passwordProfileId`. The password change on the account summary page and the product lookup on the order detail page (`src/app/(store)/account/orders/[orderId]/page.tsx`) use a `client_credentials` client, so they need `EPCC_CLIENT_SECRET`. Without the profile ID, sign-in and registration fail. Without the realm ID the reset request fails. Without the secret the password change and the order detail products fail. Browsing, the cart and guest checkout work without any of them. Create a password profile in Commerce Manager and copy its ID, and the ID of its authentication realm. Elastic Path store keys are not scoped to endpoints, so the key behind `EPCC_CLIENT_SECRET` can do more than the example needs. Keep it on the server.
- **A hierarchy with nodes in the catalog.** `buildSiteNavigation` (`src/lib/build-site-navigation.ts`) builds the header menu from the first four hierarchies and their child nodes. Without hierarchies the menu has no entries. The Category heading above the search filters comes from Klevu, not from hierarchies. Create hierarchies and nodes in Commerce Manager and include them in the catalog.

## Environment variables

Set these in `.env.local` or in your host's environment settings. `NEXT_PUBLIC_` variables are inlined at build time, so rebuild after changing one. A variable marked Yes below makes the build or the first request fail when it is missing.

| Variable | Needed | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_EPCC_CLIENT_ID` | Yes | Client ID of an application key (`src/lib/resolve-epcc-env.ts`). |
| `NEXT_PUBLIC_EPCC_ENDPOINT_URL` | Yes | The API host without a scheme, for example `useast.api.elasticpath.com`. The SDK takes it as `host` and the middleware builds `https://<value>/...` from it, so a value that starts with `https://` produces a broken URL. |
| `NEXT_PUBLIC_COOKIE_PREFIX_KEY` | Yes | Prefix of the cookie names (`<prefix>_ep_credentials`, `<prefix>_ep_cart`, `<prefix>_ep_account_member_token`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (`pk_...`), read in `src/lib/resolve-ep-stripe-env.ts`. |
| `NEXT_PUBLIC_STRIPE_ACCOUNT_ID` | Yes | Stripe account ID that Elastic Path Payments is connected to (`acct_...`). |
| `NEXT_PUBLIC_KLEVU_SEARCH_URL` | Yes | Klevu search host without a scheme. The code builds `https://<value>/cs/v2/search`. |
| `NEXT_PUBLIC_KLEVU_API_KEY` | Yes | Klevu API key. It reaches the browser. |
| `NEXT_PUBLIC_SHIPPING_API_ENDPOINT` | No | Full URL of your shipping rates API, with its scheme. The example appends `?cart_id=<cart id>`. |
| `NEXT_PUBLIC_SHIPPING_API_KEY` | No | Sent as the `Api-Key` header to the shipping rates API. It reaches the browser. |
| `NEXT_PUBLIC_PASSWORD_PROFILE_ID` | For sign-in | ID of the password profile used for sign-in and registration. |
| `NEXT_PUBLIC_AUTHENTICATION_REALM_ID` | For password change | ID of the authentication realm that holds the password profile. |
| `EPCC_CLIENT_SECRET` | For password change | Client secret of the application key. Server only: it has no `NEXT_PUBLIC_` prefix and must stay out of browser code. |
| `NEXT_PUBLIC_DOMAIN_NAME` | No | Your site's host without a scheme, used as `metadataBase` on product pages. Defaults to `http://localhost:3000`. |
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
| Password Reset                           | Leveraging  [One Time Password Token](https://elasticpath.dev/guides/How-To/Authentication/how-to-utilize-one-time-password-tokens) |
