import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  client: "@hey-api/client-fetch",
  input: "../specs/pim.yaml",
  output: { path: "src/client", format: "prettier" },
  plugins: [
    ...defaultPlugins,
    {
      style: "PascalCase",
      exportInlineEnums: false,
      name: "@hey-api/typescript",
    },
    {
      dates: true,
      name: "@hey-api/transformers",
    },
  ],
})
