import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  client: "@hey-api/client-fetch",
  input: "./specs/pim.yaml",
  output: { path: "src/client", format: "prettier" },
  types: {
    name: "PascalCase",
    enums: false,
  },
})
