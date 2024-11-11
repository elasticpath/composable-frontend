# Next.js Commerce From Elastic Path: Composable Frontend

![API First](https://github.com/elasticpath/mason/assets/3082064/8be38417-6b96-4228-ba6e-e5472e049b27)

Composable Frontend is a [Next.js Commerce](https://vercel.com/templates/next.js/nextjs-commerce) starter kit from [Elastic Path](https://www.elasticpath.com/) that accelerates storefront creation, customization, and deployment. Composable Frontend includes a modern CLI for generating Next.js storefronts.

In addition to the Next.js React framework for static and server-side rendered applications, Composable Frontend includes:

- [Elastic Path Composable Commerce](https://www.elasticpath.com/products): Our flexible commerce platform featuring exceptional product and catalog management APIs
- [Tailwind CSS](https://tailwindcss.com/): Enabling you to get started with a range of out the box components that are easy to customize
- [Headless UI](https://headlessui.com/): Completely unstyled, fully accessible UI components, designed to integrate beautifully with Tailwind CSS
- [Radix Primitives](https://www.radix-ui.com/primitives): Unstyled, accessible, open source React primitives for high-quality web apps and design systems
- [Typescript](https://www.typescriptlang.org/): JavaScript with syntax for types

## How to generate a Next.js commerce storefront with Elastic Path

```bash
> stores ep generate

┌─ info ─────────────────────────────────────────────────────────────────────┐
│                                                                            │
│ Using store: Test Store – 364eeeac-376d-4fc5-b5ee-fd70bf58038c             │   
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

? What do you want to call the project? plants-store
? What type of PLP do you want to create? Simple
? What type of payment gateway do you want to use? Simple (quick start)

┌─ info ────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  Performing setup                                                         │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

✔ Initialize Git
> Setup accounts
    Update account authentication settings
        Create password profile
■ Simple checkout (Manual Gateway) setup

┌─ success ─────────────────────────────────────────────────────────────────┐
│                                                                           │
│  Storefront generated                                                     │
│     Elastic Path store: plants-store                                      │
│     Framework: Next.js                                                    │
│                                                                           │
│  Help                                                                     │
│    • Documentation [1]                                                    │
│    • Demo stores [2]                                                      │ 
│    • Run `ep --help`                                                      │
│                                                                           │
│  Next steps                                                               │
│    • Run `cd plants-store && yarn install && yarn dev`                    │
│                                                                           │
│  Deployment                                                               │
│    • Vercel [3]                                                           │
│    • Netlify [4]                                                          │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
[1] https://elasticpath.dev/docs
[2] https://demo.elasticpath.com
[3] https://nextjs.org/learn-pages-router/basics/deploying-nextjs-app/deploy
[4] https://www.netlify.com/with/nextjs/

> stores
```

## Fast, automatic Next.js commerce configuration
```shell

┌─ info ────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  Performing setup                                                         │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

✔ Initialize Git
✔ Setup accounts
> Algolia configuration
  ■ Switching to active store
  ■ Get the integration hub auth token from Elastic Path
  ■ Create Urgl client
  ■ Get the user info for the customer
  ■ Check if instance exists on Elastic Path store
  ■ Setup Algolia Integration
  ■ Publish Catalog
  ■ Add index to .env.local file
  ■ Checking Algolia index exists
  ■ Additional Algolia setup
■ EP Payments setup

? Which catalog would you like to publish? (Use arrow keys)
> Test - 63c0d3e1-d6bd-4951-b251-ada13e1bde22
```

## Setup

```bash
pnpm install
```

Generate the types for schematic schemas during development
```bash
pnpm generate
```

## What's inside?

This turborepo uses [PNPM](https://pnpm.io/) as a package manager.

### Build

To build all apps and packages, run the following command:

```bash
pnpm build
```
