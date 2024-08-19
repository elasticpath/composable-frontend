import { defineConfig } from "tsup"
import { copy } from "esbuild-plugin-copy"

export default defineConfig(() => {
  return {
    outExtension() {
      return {
        js: `.js`,
      }
    },
    entry: {
      "blank/factory": "./blank/factory.ts",
      "schematic/factory": "./schematic/factory.ts",
      "application/index": "./application/index.ts",
      "product-details-page/index": "./product-details-page/index.ts",
      "product-list-page/index": "./product-list-page/index.ts",
      "product-list-page-algolia/index": "./product-list-page-algolia/index.ts",
      "product-list-page-klevu/index": "./product-list-page-klevu/index.ts",
      "product-list-page-simple/index": "./product-list-page-simple/index.ts",
      "featured-products/index": "./featured-products/index.ts",
      "footer/index": "./footer/index.ts",
      "header/index": "./header/index.ts",
      "home/index": "./home/index.ts",
      "account/index": "./account/index.ts",
      "promotion-banner/index": "./promotion-banner/index.ts",
      "workspace/index": "./workspace/index.ts",
      "cart/index": "./cart/index.ts",
      "d2c/index": "./d2c/index.ts",
      "utility/index": "./utility/index.ts",
      "setup-integration/index": "./setup-integration/index.ts",
      "setup-payment-gateway/index": "./setup-payment-gateway/index.ts",
      "checkout/index": "./checkout/index.ts",
      "ep-payments-payment-gateway/index":
        "./ep-payments-payment-gateway/index.ts",
      "manual-payment-gateway/index": "./manual-payment-gateway/index.ts",
    },
    format: ["cjs"],
    clean: false,
    sourcemap: false,
    esbuildPlugins: [
      copy({
        // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
        // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
        resolveFrom: "cwd",
        assets: [
          {
            from: ["./collection.json"],
            to: ["./dist/collection.json"],
          },
          {
            from: ["./package.json"],
            to: ["./dist/package.json"],
          },
          {
            from: ["./README.md"],
            to: ["./dist/README.md"],
          },
          {
            from: ["./blank/**/*"],
            to: ["./dist/blank"],
          },
          {
            from: ["./schematic/**/*"],
            to: ["./dist/schematic"],
          },
          {
            from: ["./application/**/*"],
            to: ["./dist/application"],
          },
          {
            from: ["./product-details-page/**/*"],
            to: ["./dist/product-details-page"],
          },
          {
            from: ["./product-list-page/**/*"],
            to: ["./dist/product-list-page"],
          },
          {
            from: ["./product-list-page-algolia/**/*"],
            to: ["./dist/product-list-page-algolia"],
          },
          {
            from: ["./product-list-page-klevu/**/*"],
            to: ["./dist/product-list-page-klevu"],
          },
          {
            from: ["./product-list-page-simple/**/*"],
            to: ["./dist/product-list-page-simple"],
          },
          {
            from: ["./workspace/**/*"],
            to: ["./dist/workspace"],
          },
          {
            from: ["./cart/**/*"],
            to: ["./dist/cart"],
          },
          {
            from: ["./header/**/*"],
            to: ["./dist/header"],
          },
          {
            from: ["./footer/**/*"],
            to: ["./dist/footer"],
          },
          {
            from: ["./promotion-banner/**/*"],
            to: ["./dist/promotion-banner"],
          },
          {
            from: ["./featured-products/**/*"],
            to: ["./dist/featured-products"],
          },
          {
            from: ["./home/**/*"],
            to: ["./dist/home"],
          },
          {
            from: ["./account/**/*"],
            to: ["./dist/account"],
          },
          {
            from: ["./d2c/**/*"],
            to: ["./dist/d2c"],
          },
          {
            from: ["./utility/**/*"],
            to: ["./dist/utility"],
          },
          {
            from: ["./setup-integration/**/*"],
            to: ["./dist/setup-integration"],
          },
          {
            from: ["./setup-payment-gateway/**/*"],
            to: ["./dist/setup-payment-gateway"],
          },
          {
            from: ["./checkout/**/*"],
            to: ["./dist/checkout"],
          },
          {
            from: ["./ep-payments-payment-gateway/**/*"],
            to: ["./dist/ep-payments-payment-gateway"],
          },
          {
            from: ["./manual-payment-gateway/**/*"],
            to: ["./dist/manual-payment-gateway"],
          },
        ],
      }),
    ],
  }
})
