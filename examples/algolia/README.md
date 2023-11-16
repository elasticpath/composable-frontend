# `BETA` Elastic Path D2C Starter Kit - mystorefront678

This project was generated with [Elastic Path Commerce Cloud CLI](https://www.elasticpath.com/).

The Elastic Path D2C Starter Kit is an opinionated tool box aimed at accelerating the development of direct-to-consumer
ecommerce storefronts
using [Elastic Path PXM APIs](https://documentation.elasticpath.com/commerce-cloud/docs/developer/how-to/get-started-pcm.html#__docusaurus).
Some of the aims of this project are:

- **"Not Another Demo Store"** :yawning_face:: provide useful tooling rather than a rigid API showcase
- **Configurability** :construction:: components and building blocks that can be selected and customized to specific use
  cases
- **Composable Commerce** :handshake:: the starter kit should integrate with best-in-class services to enable modern
  ecommerce workflows
- **Extensibility** :rocket:: can be expanded to include new integrations over time
- **Performance** :racing_car:: Elastic Path and Next.js framework working together to provide a fast, scalable
  storefront

## Tech Stack

- [Elastic Path PXM](https://www.elasticpath.com/products/product-experience-manager): our next generation product and
  catalog management APIs

- [Next.js](https://nextjs.org/): a React framework for building static and server-side rendered applications

- [Tailwind CSS](https://tailwindcss.com/): enabling you to get started with a range of out the box components that are
  easy to customize

- [Headless UI](https://headlessui.com/): completely unstyled, fully accessible UI components, designed to integrate
  beautifully with Tailwind CSS.

- [Typescript](https://www.typescriptlang.org/): JavaScript with syntax for types

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

## Helper components:

### Navigation

The store navigation component is node/hierarchy driven and built statically. The ‘top level’ is created directly by the
base hierarchies in your EPCC store. This is currently limited to 5 items. 5 ‘direct child’ nodes of each hierarchy, and
the nodes attached to them, are supported.

### Footer

A simple static component with links to placeholder pages provided

### Featured products

Helper display component that will show basic information about products in a given hierarchy or node.

### Promotion banner

Helper display component that will show a basic banner with info (title, description) about a promotion.

### Cart and checkout

Currently supporting Elastic Path Payments

## Setup

> If you have already configured your integrations at generation time then you're good to go and can skip this section.

> :warning: **Requires Algolia account and index**: the current early release of this project requires a properly
> configured Algolia index.

You can configure your site via composable cli or manually.

### Composable CLI Configuration

The easiest way to get started is to use the [composable cli](https://www.npmjs.com/package/composable-cli) to configure
the project.

#### Algolia Configuration

From inside your project directory run:

```bash
composable-cli init algolia
```

#### Elastic Path Payments

From inside your project directory run:

```bash
composable-cli payments ep-payments
```

### Manual Configuration

#### Algolia Configuration

There are a couple of setup steps that need to be done to get started:

- Local environment
- Algolia index

### Setup Local Environment

First, make a copy of the `.env.example` and rename it to `.env.local.` Set at least the values marked `<required>`

### Setup Currency

Add `NEXT_PUBLIC_DEFAULT_CURRENCY_CODE` value in your environment file. Make sure you use ISO currency code in uppercase
e.g. USD, GBP, EUR, CAD etc.

### Setup Algolia index

#### Initial setup

Make sure you have an Algolia account. Free accounts can be created [on their website](https://www.algolia.com/).

Once you have your api keys from Algolia you need to configure the Algolia integration from Commerce Manager
e.g. https://euwest.cm.elasticpath.com/integrations-hub

Follow
the [Integrating with Algolia](https://documentation.elasticpath.com/commerce-cloud/docs/dashboard/integrations/algolia-integration.html#__docusaurus)
instructions as outlined in our docs.

You're looking for the **"Algolia Integration - Full / Delta / Large Catalog"** integration.

#### Supporting category pages

Our category pages depend on Algolia at the moment and more specially make use of the Aloglia instantsearch widgets.
These widgets make use of Facets which have to be configured currently.

##### Configuring facets

Use the
instructions [in the Algolia docs](https://www.algolia.com/doc/guides/solutions/ecommerce/business-users/initial-configuration/faceting/#step-1-declare-attributes-for-faceting)
to configure the following attribute for faceting:

```
ep_categories.lvl0
ep_categories.lvl1
ep_categories.lvl2
ep_categories.lvl3

ep_slug_categories.lvl0
ep_slug_categories.lvl1
ep_slug_categories.lvl2
ep_slug_categories.lvl3
```

Use default settings.

##### Create Replicas (standard)

We make use of two **standard** replicas two demonstrate sort:

```
my_catalog_index_price_asc
my_catalog_index_price_desc
```

Follow ["Creating a replica"](https://www.algolia.com/doc/guides/managing-results/refine-results/sorting/how-to/sort-by-attribute/#using-the-dashboard)
in the Algolia docs to set both of these up based on the main index created previously by the integrations hub Aloglia
integration. Make sure to create a **standard** replica.

#### Finally

Make sure you add the three required Algolia environment variables to your `.env.local` file for local dev and your
production environment.

```
NEXT_PUBLIC_ALGOLIA_APP_ID=<required>
NEXT_PUBLIC_ALGOLIA_API_KEY=<required>
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=<required>
```

### Dev Server

then, run the development server:

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page will hot reload as you edit the file.

## Deployment

Deployment is typical for a Next.js site. We recommend using a provider
like [Netlify](https://www.netlify.com/blog/2020/11/30/how-to-deploy-next.js-sites-to-netlify/)
or [Vercel](https://vercel.com/docs/frameworks/nextjs) to get full Next.js feature support.
