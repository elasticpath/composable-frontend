import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  client: "@hey-api/client-fetch",
  input: "../specs/shopper.yaml",
  output: { path: "src/client", format: "prettier" },
  types: {
    name: "PascalCase",
    enums: false,
    dates: "types+transform",
  },
})
