# Composable Frontend From Elastic Path

![API First](https://github.com/elasticpath/mason/assets/3082064/8be38417-6b96-4228-ba6e-e5472e049b27)

Composable Frontend is a modern starter kit built on Next.js from Elastic Path. It enables developers to rapidly create, customize, and deploy tailored storefronts, leveraging cutting-edge tools and best practices. With a robust CLI for generating custom storefronts, Composable Frontend offers flexibility and efficiency for building unique eCommerce experiences.

Learn more:
* [Build a Next.js Storefront with Composable Frontend](https://www.elasticpath.com/blog/build-a-nextjs-storefront-with-composable-frontend)
* [Composable Frontend Documentation](https://elasticpath.dev/docs/developer-tools/composable-starter/storefront-starter)

In addition to the Next.js React framework for static and server-side rendered applications, Composable Frontend includes:

- [Elastic Path Composable Commerce](https://www.elasticpath.com/products): Our flexible commerce platform featuring exceptional product and catalog management APIs
- [Tailwind CSS](https://tailwindcss.com/): Enabling you to get started with a range of out the box components that are easy to customize
- [Headless UI](https://headlessui.com/): Completely unstyled, fully accessible UI components, designed to integrate beautifully with Tailwind CSS
- [Radix Primitives](https://www.radix-ui.com/primitives): Unstyled, accessible, open source React primitives for high-quality web apps and design systems
- [Typescript](https://www.typescriptlang.org/): JavaScript with syntax for types

## How to generate a Next.js commerce storefront with Elastic Path

In your terminal, run the following command to create a new Composable Starter app:

```bash
ep generate my-storefront
```

where `my-storefront` is the name you want to call your storefront project.

### Select a store[​](https://elasticpath.dev/docs/developer-tools/composable-starter/storefront-starter#select-a-store "Direct link to Select a store")

If you've not selected a store yet, you'll be prompted to select a store from a list of stores that you have access to.

Select the store you want to use for your storefront. If you've already selected a store you will see the "Using store" info message that tells you what store is active. You can switch store by calling the `ep store set` command [learn more here](https://elasticpath.dev/docs/developer-tools/composable-cli/commands#command-reference)

### Select configuration[​](https://elasticpath.dev/docs/developer-tools/composable-starter/storefront-starter#select-configuration "Direct link to Select configuration")

The Composable CLI will prompt you to select from different configurations.

* PLP (Product List Page) type - storefront page that presents a list of products based on a category or search query
* Payment Gateway - the payment processor that will handle checkout in the storefront

For this tutorial, select the following options:

* PLP type: `Simple`
* Payment Gateway: `Simple (quick start)`

Once you've selected your configuration, the Composable CLI will create a new directory with the name you provided, scaffold out your new storefront project and perform configurations based on the options you selected.

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
