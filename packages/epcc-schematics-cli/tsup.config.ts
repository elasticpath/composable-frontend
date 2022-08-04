import { defineConfig } from "tsup"
import { copy } from "esbuild-plugin-copy"
import { jsonSchemaToDts } from "./plugins/esbuild-json-schema-to-dts"

export default defineConfig(({ env }) => {
  return {
    outExtension({ format }) {
      return {
        js: `.js`,
      }
    },
    entry: ["./src/schematics.ts"],
    outDir: "./dist/bin",
    format: ["cjs"],
    dts: true,
    clean: true,
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
            from: ["./src/blank/**/*"],
            to: ["./dist/blank"],
            keepStructure: true,
          },
          {
            from: ["./src/schematic/**/*"],
            to: ["./dist/schematic"],
            keepStructure: true,
          },
        ],
      }),
      jsonSchemaToDts({
        resolveFrom: "cwd",
        assets: [
          {
            from: "./src/**/schema.json",
            to: "./dist",
          },
        ],
      }),
    ],
  }
})
