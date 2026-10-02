import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: "../specs/shopper.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  parser: {
    patch: {
      schemas: {
        CatalogSearchJobAttributes: (schema) => {
          const jobType = (
            schema.properties as Record<string, { default?: unknown }>
          ).type
          delete jobType?.default
        },
      },
    },
    transforms: { readWrite: false },
  },
  plugins: [
    {
      baseUrl: "https://euwest.api.elasticpath.com",
      name: "@hey-api/client-fetch",
    },
    { name: "@hey-api/typescript" },
    { name: "@hey-api/sdk" },
    { compatibilityVersion: 3, name: "zod" },
    { name: "@tanstack/react-query" },
  ],
})
