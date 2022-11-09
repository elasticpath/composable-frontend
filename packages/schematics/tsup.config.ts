import { defineConfig } from "tsup"
import { copy } from "esbuild-plugin-copy"

export default defineConfig(() => {
  return {
    outExtension() {
      return {
        js: `.js`
      }
    },
    entry: {
      "blank/factory": "./blank/factory.ts",
      "schematic/factory": "./schematic/factory.ts",
      "d2c/index": "./d2c/index.ts",
      "application/index": "./application/index.ts",
      "product-details-page/index": "./product-details-page/index.ts",
      "workspace/index": "./workspace/index.ts",
      "cart/index": "./cart/index.ts",
      "ep-new/index": "./ep-new/index.ts",
      "utility/index": "./utility/index.ts"
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
            to: ["./dist/collection.json"]
          },
          {
            from: ["./package.json"],
            to: ["./dist/package.json"]
          },
          {
            from: ["./README.md"],
            to: ["./dist/README.md"]
          },
          {
            from: ["./blank/**/*"],
            to: ["./dist/blank"],
            keepStructure: true
          },
          {
            from: ["./schematic/**/*"],
            to: ["./dist/schematic"],
            keepStructure: true
          },
          {
            from: ["./d2c/**/*"],
            to: ["./dist/d2c"],
            keepStructure: true
          },
          {
            from: ["./application/**/*"],
            to: ["./dist/application"],
            keepStructure: true
          },
          {
            from: ["./product-details-page/**/*"],
            to: ["./dist/product-details-page"],
            keepStructure: true
          },
          {
            from: ["./workspace/**/*"],
            to: ["./dist/workspace"],
            keepStructure: true
          },
          {
            from: ["./cart/**/*"],
            to: ["./dist/cart"],
            keepStructure: true
          },
          {
            from: ["./ep-new/**/*"],
            to: ["./dist/ep-new"],
            keepStructure: true
          },
          {
            from: ["./utility/**/*"],
            to: ["./dist/utility"],
            keepStructure: true
          }
        ]
      })
    ]
  }
})
