import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  client: "@hey-api/client-fetch",
  experimentalParser: true,
  input: "../specs/subscriptions.yaml",
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
  ],
})
