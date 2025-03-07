import { defineConfig, defaultPlugins } from "@hey-api/openapi-ts"
import { defineConfig as defineReadmeConfig } from "../specs/heyapi/plugins"

export default defineConfig({
  client: "@hey-api/client-fetch",
  input: "../specs/shopper.yaml",
  experimentalParser: true,
  output: { path: "src/client", format: "prettier" },
  plugins: [
    ...defaultPlugins,
    {
      exportInlineEnums: true,
      name: "@hey-api/typescript",
    },
    {
      dates: true,
      name: "@hey-api/transformers",
    },
    "@tanstack/react-query",
    defineReadmeConfig({
      name: "generate-readme",
      targetOperation: "getByContextProduct",
    }),
  ],
})
