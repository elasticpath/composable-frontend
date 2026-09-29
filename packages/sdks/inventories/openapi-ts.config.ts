import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: "../specs/inventories.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  plugins: [
    {
      baseUrl: "https://euwest.api.elasticpath.com/v2",
      name: "@hey-api/client-fetch",
    },
    { name: "@hey-api/typescript" },
    { name: "@hey-api/sdk" },
    { compatibilityVersion: 3, name: "zod" },
  ],
})
