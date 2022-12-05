import { defineConfig } from "tsup"
import { copy } from "esbuild-plugin-copy"

export default defineConfig(({ env }) => {
  return {
    outExtension({ format }) {
      return {
        js: `.js`
      }
    },
    entry: {
      "bin/mason": "src/mason.ts"
    },
    format: ["cjs"],
    dts: {
      entry: {
        "bin/mason": "src/mason.ts"
      }
    },
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
            from: ["./src/blank/**/*"],
            to: ["./dist/blank"],
            keepStructure: true
          },
          {
            from: ["./src/schematic/**/*"],
            to: ["./dist/schematic"],
            keepStructure: true
          },
          {
            from: ["./src/d2c/**/*"],
            to: ["./dist/d2c"],
            keepStructure: true
          },
          {
            from: ["./src/application/**/*"],
            to: ["./dist/application"],
            keepStructure: true
          },
          {
            from: ["./src/workspace/**/*"],
            to: ["./dist/workspace"],
            keepStructure: true
          },
          {
            from: ["./src/utility/**/*"],
            to: ["./dist/utility"],
            keepStructure: true
          }
        ]
      })
    ]
  }
})
