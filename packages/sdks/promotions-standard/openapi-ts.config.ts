import { defineConfig } from "@hey-api/openapi-ts"
import { int64AsNumber } from "../specs/heyapi/int64-as-number"

export default defineConfig({
  // The bundle, not the spec: it carries the corrections in ../specs/overrides/.
  input: "../specs/bundled/promotions-standard_standalone.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  plugins: [
    {
      baseUrl: "https://euwest.api.elasticpath.com",
      name: "@hey-api/client-fetch",
    },
    { name: "@hey-api/typescript" },
    { name: "@hey-api/sdk" },
    {
      $resolvers: { number: int64AsNumber },
      compatibilityVersion: 3,
      name: "zod",
    },
  ],
})
