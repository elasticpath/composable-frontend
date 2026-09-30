import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  // The bundle, not the spec: it carries the corrections in ../specs/overrides/.
  input: "../specs/bundled/rule-promotions_standalone.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
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
