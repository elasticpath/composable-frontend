# Simple Elastic Path storefront starter

This storefront accelerates the development of a direct-to-consumer ecommerce experience using Elastic Path.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Fsimple&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL,NEXT_PUBLIC_SITE_NAME,NEXT_PUBLIC_PASSWORD_PROFILE_ID&envDescription=Api%20keys%20can%20be%20found%20in%20your%20keys%20section%20of%20commerce%20manager&envLink=https%3A%2F%2Felasticpath.dev%2Fdocs%2Fdeveloper-tools%2Fcomposable-starter%2Fdeploy%2Fstorefront-deploy&project-name=elastic-path-storefront&repository-name=elastic-path-storefront)

## Tech Stack

- [Elastic Path](https://www.elasticpath.com/products): A family of composable products for businesses that need to quickly & easily create unique experiences and next-level customer engagements that drive revenue.

- [Elastic Path Gen 2 Sdk](https://www.npmjs.com/package/@epcc-sdk/sdks-shopper): A set of SDKs that provide a simple way to interact with Elastic Path Commerce Cloud APIs.

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
pnpm dev
# or
yarn dev
# or
npm run dev
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

| **Feature**                             | **Notes**                                                                                     |
|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| PDP                                     | Product Display Pages                                                                         |
| PLP                                     | Product Listing Pages.                                                                        |
| EPCC PXM product variations             | [Learn more](https://elasticpath.dev/docs/pxm/products/pxm-product-variations/pxm-variations) |
| EPCC PXM bundles                        | [Learn more](https://elasticpath.dev/docs/pxm/products/pxm-bundles/pxm-bundles)               |
| EPCC PXM hierarchy-based navigation menu | Main site nav driven directly from your store's hierarchy and node structure                  |
| Checkout                                | [Learn more](https://elasticpath.dev/docs/commerce-cloud/checkout/checkout-workflow)          |
| Cart                                    | [Learn more](https://elasticpath.dev/docs/commerce-cloud/carts/carts)                         |
| Accounts                                | [Learn more](https://elasticpath.dev/docs/api/accounts/account-management-introduction)                         |
| Account Orders                          | [Learn more](https://elasticpath.dev/docs/api/carts/get-customer-orders)                         |
| Account Addresses                       | [Learn more](https://elasticpath.dev/docs/api/addresses/addresses-introduction)                         |
| Multi location inventory                | [Learn more](https://elasticpath.dev/docs/api/pxm/inventory_mli/inventories-introduction)                         |
| Bundles that contain a product          | Requires Catalog Search. See [Bundles that contain a product](#bundles-that-contain-a-product) |
| Related products                        | Requires a Custom Relationship with the slug `CRP_you-may-also-like`. See [Related products](#related-products) |
| Add several products in one request     | All or nothing, from search results. See [Add several products to the cart at once](#add-several-products-to-the-cart-at-once) |

## Search results and product variations

Search results show one card per product family. A family with four sizes
appears once, not four times. The card reads the family's options from the
parent product. Selecting an option moves the card's price, image and link to
the matching child product.

The storefront excludes child products from search with the filter
`meta.product_types:!=child`. Filtering on an option value works without any
store configuration.

Free-text search over option values is off by default. Without it, a shopper
who types an option value such as "Large" gets no results. To turn it on:

1. Open your search profile in Commerce Manager.
2. Go to Searchable attributes.
3. Enable `meta.search.variation_options.name`,
   `meta.search.variation_options.description` and
   `meta.search.variation_options.variation_name`.
4. Save the profile and re-index the store.

This changes relevance for every search in the store, not only for product
families.

Faceting on option values is not available. The index marks these fields as not
facetable, so you cannot build a "Size" filter from them.

## Bundles that contain a product

A product page lists the bundles that contain the product. A bundle is a
product made of other products. The page hides the section, heading included,
when no bundle contains the product.

This feature requires Catalog Search. The storefront filters on
`meta.search.component_options.id`, which Catalog Search indexes on every
store. The filter needs no store configuration and no admin credentials.

Catalog Search applies the catalog rules of the shopper. A shopper sees only
the bundles published to them. The same product can belong to more bundles for
an administrator.

A store that does not index the field answers HTTP 400 for this filter. The
storefront treats a failed search as "no bundles" and hides the section, so the
product page still works.

Some bundles set a price on each component instead of on the bundle. The card
shows a price only when the bundle has one.

## Related products

A product page lists up to four products related to it through one Custom
Relationship. Commerce Manager calls these Product Relationships. The page
hides the section, heading included, when the product has no related products.

**Store requirement:** the store must define a Custom Relationship with the slug
`CRP_you-may-also-like`. The slug includes the `CRP_` prefix. The storefront
reads only this slug. To use another one, change `RELATED_PRODUCTS_SLUG` in
`src/lib/fetch-related-products.ts`. It is a constant, not an environment
variable, because it describes the shape of the store.

The storefront does not read the relationship links on the product. Those links
often disagree with what the relationship endpoint returns.

The shopper API gives a relationship no display name. The heading "You may also
like" is `RELATED_PRODUCTS_HEADING` in the same file.

The shopper sees the relationships in the published catalog release. A change
to a relationship appears after you republish the catalog.

A slug that the store does not define returns an empty list, not an error. If
the store has no such relationship, or a request fails, the storefront hides the
section and the product page still works.

## Add several products to the cart at once

A shopper can select several products on the search results page and add them
to the cart with one action. The storefront sends every selected product in one
request to the Cart API (`POST /v2/carts/{cartID}/items`), with
`options.add_all_or_nothing` set to `true`. If the cart cannot take one of the
products, it takes none of them.

The request sets the option explicitly. Its default is `false`, which adds the
valid products and rejects the others.

Do not build this as a loop of single adds in the browser. If the third of four
adds fails, the first two stay in the cart, and only more requests can remove
them.

**Store requirements:** Catalog Search, which the search results page already
needs, and a cart. The feature uses the shopper's guest or account cart and the
shopper's catalog. It needs no other store configuration.

What the shopper can select:

- A standard product.
- A product family, after the shopper chooses every option on its card. The
  storefront adds the child product that the options resolve to, never the
  parent. The cart rejects a parent product.
- Nothing else. A family card without a full choice of options, and every
  bundle card, has a disabled checkbox with the reason beside it.

Bundles are not this feature. A bundle is one cart line that holds a
configuration someone authored in advance, and the shopper cannot remove one of
its products. To add a bundle, use its product page.

Each selected product is added with quantity 1. Changing the page, the search
text, a filter or the sort order clears the selection, and so does a successful
add. The selection belongs to the cards on screen, because a family card keeps
its chosen options only while it is shown.

When the cart rejects the request, it answers with HTTP 400, 404 or 422 and one
error for each product it refused. Each error names the product in `meta.id`.
The storefront tells the shopper that nothing was added and lists each refused
product with its reason, for example "Insufficient stock". The selection stays,
so the shopper can clear the refused product and try again.

Any other failure, such as a server error or no answer at all, does not prove
that the cart is unchanged. The storefront then asks the shopper to check the
cart before trying again, and does not say that nothing was added.

Out of scope: a partial add. With `add_all_or_nothing` set to `false`, the cart
answers 201 and reports the refused products in an `errors` array. The
generated SDK type for the 201 response has no `errors` field, so the storefront
could read those errors only by casting past its own types.
