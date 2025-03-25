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
