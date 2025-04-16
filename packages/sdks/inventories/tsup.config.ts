import { defineConfig } from "tsup"
import {
  fixAliasPlugin,
  fixFolderImportsPlugin,
  fixExtensionsPlugin,
} from "esbuild-fix-imports-plugin"

export default defineConfig({
  entry: ["src/**/*.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: false,
  bundle: false,
  esbuildPlugins: [
    fixAliasPlugin(),
    fixFolderImportsPlugin(),
    fixExtensionsPlugin(),
  ],
  external: ["@hey-api/client-fetch"],
  outDir: "dist",
  outExtension(ctx) {
    return {
      dts: ".d.ts",
      js: ctx.format === "cjs" ? ".cjs" : ".mjs",
    }
  },
  target: "es2020",
  esbuildOptions(options) {
    // Needed to get proper paths when bundling is disabled
    options.preserveSymlinks = true
  },
})
