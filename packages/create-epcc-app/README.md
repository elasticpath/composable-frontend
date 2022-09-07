# Create Elastic Path Commerce Cloud Storefront

The fastest way to get up and running with Elastic Path Commerce Cloud is by using `create-epcc-app`. To get started, use the following command:

```bash
npx create-epcc-app@latest --example d2c-aloglia
# or
yarn create epcc-app --example d2c-aloglia
# or
pnpm create epcc-app --example d2c-aloglia
```

To create a new app in a specific folder, you can send a name as an argument. For example, the following command will create a new Next.js app called `blog-app` in a folder with the same name:

```bash
npx create-epcc-app@latest my-store --example d2c-aloglia
# or
yarn create epcc-app my-store --example d2c-aloglia
# or
pnpm create epcc-app my-store --example d2c-aloglia
```

## Options

`create-epcc-app` options:

- **-e, --example - An example to bootstrap the app with (currently only support d2c-algolia)
- **--use-npm** - Explicitly tell the CLI to bootstrap the app using npm. To bootstrap using yarn we recommend to run `yarn create epcc-app`
- **--use-pnpm** - Explicitly tell the CLI to bootstrap the app using pnpm. To bootstrap using pnpm we recommend running `pnpm create epcc-app`
