import { defineConfig } from "tsup"
import { copy } from "esbuild-plugin-copy"
import "dotenv/config"

export default defineConfig(({ env }) => {
  return {
    outExtension({ format }) {
      return {
        js: `.js`,
      }
    },
    entry: {
      "bin/composable": "src/composable.ts",
    },
    format: ["cjs"],
    dts: {
      entry: {
        "bin/composable": "src/composable.ts",
      },
    },
    esbuildOptions(options) {
      options.define = {
        ...options.define,
        "process.env.POSTHOG_PUBLIC_API_KEY": `"${process.env.POSTHOG_PUBLIC_API_KEY}"`,
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
            from: ["./README.md"],
            to: ["./dist/README.md"],
          },
          {
            from: ["./package.json"],
            to: ["./dist/package.json"],
          },
        ],
      }),
    ],
  }
})
