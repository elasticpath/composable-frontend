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
| Variation swatches                      | From each child product's `shopper_attributes.color` or main image. See [Variation swatches](#variation-swatches) |

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

## Variation swatches

A variation option can show as a colour dot or as a picture of the product
instead of as text. The product page and the search cards use the same rule and
the same control.

Elastic Path has no variation type. A variation has a name and options, and
nothing marks it as a colour. Product data that differs per option belongs on
the child product, so the swatch comes from there. The storefront follows the
parent's `variation_matrix` from each option to its child product. It holds the
shopper's other choices fixed, or uses each other variation's first option until
the shopper chooses.

What the store must hold:

- **Colour dot.** Set `color` in `shopper_attributes` on each child product, as
  `#rgb` or `#rrggbb`, for example `#1f3a93`. Set it on the children, not on the
  parent. On a rebuild of child products, a key on the parent overwrites the
  same key on every child. A key that only the child has survives the rebuild.
- **Picture.** Give each child product its own main image. A child keeps its own
  main image when the child products are rebuilt.

The search cards read the same two fields. A hit's body is the catalog product,
so neither field needs a search index setting.

A variation shows dots only when at least two of its options lead to children
with different valid colours. It shows pictures only when at least two of its
options lead to children with different main images. Otherwise it shows text.
This is why a Size variation whose children share one photo stays as text,
and why a colour inherited from the parent shows nowhere.

Within a variation that shows swatches, each option chooses on its own:

1. The child's colour, if it is a valid hex colour.
2. Otherwise the child's main image.
3. Otherwise the option name as text, as before.

The storefront ignores any other colour value, such as `navy` or `rgb(0,0,0)`.

Every option is a radio input. The Tab key reaches each variation once, and
the arrow keys move between its options. A swatch keeps the option name for
screen readers and shows it as a tooltip. On the product page, the name of the
selected option follows the variation name. The selected swatch has a dark
ring set apart from the swatch, so it shows on light and dark colours alike.
Selecting a swatch changes the product the same way the text option does.

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

## Facet search on a store taxonomy field

The search results page can show one more facet beside Categories and Price,
with a count for each value. The facet reads one product field that you name.
Use it when the store keeps its own taxonomy on the product, for example a
product line or a range. If the taxonomy is a node hierarchy, the Categories
facet already covers it and you need none of this.

### Store setup requirements

- **Catalog Search is enabled for the store.** This is a manual step. No API
  call can do it.
- **Search is enabled on the catalog the shopper resolves to, and the catalog
  has been published since.** This is also manual. Publishing creates the
  search index for the release.
- **A product field that holds the taxonomy.** Use one of these forms:
  - `shopper_attributes.<name>`: a merchant-defined attribute on the product.
    It needs no template. The name has at most 64 characters: letters, digits,
    `_` or `-`.
  - `extensions.products(<template slug>).<field slug>`: a field of a product
    template. Search can facet on an enumerated string, a number or a boolean.
    It cannot facet on a free-text field.

  `admin_attributes.<name>` does not work, because search does not return it.
- **Products carry values in that field.** The facet shows only values on
  published products. The values are catalog content, so the provisioning
  script does not set them.
- **The field is registered as facetable, and the indexes are rebuilt.** The
  provisioning script below does this.

### Configure the storefront

Set the field in `.env.local`, then rebuild. `NEXT_PUBLIC_` values are fixed at
build time.

```bash
NEXT_PUBLIC_SEARCH_TAXONOMY_FIELD=shopper_attributes.range
```

The facet heading comes from the last part of the field name, so
`shopper_attributes.range` shows as "Range". When the variable is not set, the
facet and its heading do not show.

The chosen values go in the `taxonomy` query parameter. They stay when the
shopper changes category, and a shared link opens with the same values chosen.

The storefront holds no admin credential. The facet uses the same shopper search
as the rest of the page.

### Provision the field

Registering a field and rebuilding the indexes need an admin
`client_credentials` key. An implicit token gets HTTP 403 on every one of these
calls, reads included. The script therefore runs from your shell and is not part
of the storefront.

Put the admin key in a file that Next.js does not read, for example
`.env.provision.local`. Never put it in `.env.local`, because the storefront reads
that file.

```bash
EP_ENDPOINT_URL=https://euwest.api.elasticpath.com
EP_ADMIN_CLIENT_ID=...
EP_ADMIN_CLIENT_SECRET=...
NEXT_PUBLIC_SEARCH_TAXONOMY_FIELD=shopper_attributes.range
```

Run the script from `examples/core`, because the file path is relative:

```bash
pnpm exec tsx --env-file=.env.provision.local scripts/provision-search-facet.ts
```

`pnpm provision:search-facet` runs the same script with the variables already in
your shell.

What the script does:

1. It reads the store's indexable fields. This is one resource for the whole
   store. It holds every registered field and the index-wide settings, such as
   stemming and token separators.
2. It adds the field as facetable and keeps every other field and setting as it
   was. It then writes the whole resource back. The API replaces the resource
   and does not merge it, so a write of only the new field would remove every
   other registered field. The script prints the field list before and after.
3. It asks for a reindex. The reindex rebuilds every search index in the store
   that is out of sync, not only the shopper's catalog.
4. It checks `GET /pcm/catalogs/search-indexes?out_of_sync=true` every 10
   seconds until no index is out of sync. The reindex has no job status
   endpoint, so this is the only way to know it has finished. The script stops
   after 15 minutes, or at the first failed request.

You can run the script again. If the field is already facetable, it writes
nothing. It then waits for any index that is still out of sync, so a run that
timed out can continue. If the organization owns the store's indexable fields,
the script stops, because the store cannot change them.

If the reindex leaves releases out of sync, republish the catalog. Publishing
builds the new release's index with the fields registered at that moment, and
the shopper searches the latest release. On the integration store, a tenant
reindex left four older releases out of sync for longer than 15 minutes, while a
publish made just after the field was registered gave an index in sync within a
minute.

### What the storefront shows when something is missing

The search page runs one small check search, beside the page's own search. If a
store requirement is missing, the page goes to the configuration error page and
names the requirement:

- **The configured field cannot be faceted on.** The field is not registered,
  is not facetable, or the indexes have not been rebuilt yet. Search answers
  HTTP 400 for the whole request in this case, not only for the facet. The page
  tells you to run the provisioning script, or to unset the variable.
- **Catalog Search is not enabled.** With a shopper token, search gives the same
  answer for each of these: search is off for the store, search is off for the
  catalog, no catalog rule matches the shopper, and the catalog has no published
  release. The page lists all of them, because it cannot tell which one is
  missing.

A search that fails during the server render does not stop the page: the server
render uses empty results, and the check above then redirects. Without this,
`react-instantsearch-nextjs` waits for a result that never comes, and the page
never finishes loading. A failure that is not one of the store problems above
shows as no results.
