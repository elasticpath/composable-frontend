# `BETA` Elastic Path D2C Starter Kit - basic

This project was generated with [Elastic Path Commerce Cloud CLI](https://www.elasticpath.com/).

The Elastic Path D2C Starter Kit is an opinionated tool box aimed at accelerating the development of direct-to-consumer ecommerce storefronts using [Elastic Path PXM APIs](https://documentation.elasticpath.com/commerce-cloud/docs/developer/how-to/get-started-pcm.html#__docusaurus). Some of the aims of this project are:

- **"Not Another Demo Store"** :yawning_face:: provide useful tooling rather than a rigid API showcase
- **Configurability** :construction:: components and building blocks that can be selected and customized to specific use cases
- **Composable Commerce** :handshake:: the starter kit should integrate with best-in-class services to enable modern ecommerce workflows
- **Extensibility** :rocket:: can be expanded to include new integrations over time
- **Performance** :racing_car:: extensive use of Next.js static generation for speed

## Tech Stack

- Next.js

- EPCC PXM: our next generation product and catalog management APIs

- Chakra UI: enabling you to get started with a range of out the box components that are easy to customize

- Algolia: our current search solution

- Netlify (currently)

## Roadmap

A list of planned enhancements for this project

- `create-elasticpath-app`: we aim to provide a CLI interface for the app similar to `create-react-app` and other tools you may have used
  This stands to enable a key goal which is to allow you to ‘scaffold’ out your app at create-time, specifying the app structure, integrations and behaviour you require

- Additional integrations: we have plans to support additional search providers alongside CMS and site builder integrations

## Current feature set reference

| **Feature**                              | **Notes**                                                                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Static PDP                               | Product Display Pages                                                                                                                 |
| Static PLP                               | Product Listing Pages. Currently driven via Algolia                                                                                   |
| EPCC PXM product variations              | [Learn more](https://documentation.elasticpath.com/commerce-cloud/docs/developer/how-to/generate-pcm-variations.html)                 |
| EPCC PXM static bundles                  | [Learn more](https://documentation.elasticpath.com/commerce-cloud/docs/dashboard/pcm-products/bundle-configuration.html#__docusaurus) |
| EPCC PXM hierarchy-based navigation menu | Main site nav driven directly from your store's hiearchy and node structure                                                           |
| Prebuilt helper components               | Some basic building blocks for typical ecommerce store features                                                                       |

## Helper components:

### Navigation

The store navigation component is node/hierarchy driven and built statically. The ‘top level’ is created directly by the base hierarchies in your EPCC store. This is currently limited to 5 items. 5 ‘direct child’ nodes of each hierarchy, and the nodes attached to them, are supported.

### Footer

A simple static component with links to placeholder pages provided

### Featured products

Helper display component that will show basic information about products in a given hierarchy or node. Can be passed either a hierarchy/node id from which products can be fetched dynamically, or statically provided as a populated object via a`getStaticProps` call.

### Featured hierarchies/nodes

Helper display component that will show basic information about a hierarchy or node. Can be passed either a hierarchy/node id which can be fetched dynamically, or statically provided as a populated object via a`getStaticProps` call.

### Promotion banner

Helper display component that will show a basic banner with info (title, description) about a promotion. Must be passed populated object via a`getStaticProps` call because fetching promotions required a `client_credentials` token. You can optionally add a background image to a promotion via a custom flow field named `epcc-reference-promotion-image` (add a string URL of where the image can be fetched from)

### Cart and checkout

Currently supporting Braintree checkout (Elastic Path Payments coming soon)

## Setup

> :warning: **Requires Algolia account and index**: the current beta release of this project requires a properly configured Algolia index.

There are a couple of setup steps that need to be done to get started:

- Local environment
- Algolia index

### Setup Local Environment

First, make a copy of the `.env.example` and rename it to `.env.local.` Set at least the values marked `<required>`

### Setup Currency

Add `NEXT_PUBLIC_DEFAULT_CURRENCY_CODE` value in your environment file. Make sure you use ISO currency code in uppercase e.g. USD, GBP, EUR, CAD etc.

### Setup Algolia index

> :tired_face: We recognise manually configuring Algolia in this way is a pain. We are working on tools to streamline this process.

#### Initial setup

Make sure you have an Algolia account. Free accounts can be created [on their website](https://www.algolia.com/).

Once you have your api keys from Algolia you need to configure the Algolia integration from Commerce Manager e.g. https://euwest.cm.elasticpath.com/integrations-hub

Follow the [Integrating with Algolia](https://documentation.elasticpath.com/commerce-cloud/docs/dashboard/integrations/algolia-integration.html#__docusaurus) instructions as outlined in our docs.

You're looking for the **"Algolia Integration - Full / Delta / Large Catalog"** integration.

#### Supporting category pages

Our category pages depend on Algolia at the moment and more specially make use of the Aloglia instantsearch widgets. These widgets make use of Facets which have to be configured manually currently.

##### Configuring facets

Use the instructions [in the Algolia docs](https://www.algolia.com/doc/guides/solutions/ecommerce/business-users/initial-configuration/faceting/#step-1-declare-attributes-for-faceting) to configure the following attribute for faceting:

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

Follow ["Creating a replica"](https://www.algolia.com/doc/guides/managing-results/refine-results/sorting/how-to/sort-by-attribute/#using-the-dashboard) in the Algolia docs to set both of these up based on the main index created previously by the integrations hub Aloglia integration. Make sure to create a **standard** replica.

#### Finally

Make sure you add the three required Algolia environment variables to your `.env.local` file for local dev and your production environment.

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

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Git Commits

### Depends on

- [lint-staged](https://github.com/okonet/lint-staged)
- [husky](https://github.com/typicode/husky)

### Pre-commit hooks details

The project has a pre-commit hook that will run four stages independently for .ts, .tsx, .js and .jsx files

- runs `prettier` formating fix
- typecheck by running `tsc`
- validate code using `eslint` with the `next lint` command
- runs a final `prettier` format check to make sure nothing slipped through.

This is configured in the .lintstagedrc.js file in the root project directory.

## Deployment

Deployment is typical for a Next.js site. We recommend using a provider like Netlify or Vercel to get full Next.js feature support.

You can use an EPCC Webhook created via Commerce Manager to trigger rebuild of your static pages with the ‘catalog updated’ event

On demand incremental static regeneration is supported and encouraged, however currently this is only supported via Vercel.
