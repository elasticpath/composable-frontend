import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: "../specs/bundled/cart_checkout_standalone.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  parser: { transforms: { readWrite: false } },
  plugins: [
    {
      baseUrl: "https://euwest.api.elasticpath.com",
      name: "@hey-api/client-fetch",
    },
    { name: "@hey-api/typescript" },
    { name: "@hey-api/sdk" },
    { compatibilityVersion: 3, name: "zod" },
  ],
})
