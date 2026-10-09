import { defineConfig } from "@hey-api/openapi-ts"
import { int64AsNumber } from "../specs/heyapi/int64-as-number"

// Two plugins are deliberately absent: @hey-api/transformers, which types date-time as Date
// and int64 as bigint while nothing wires the transformers in, and the local generate-readme,
// which targets the pre-0.7x plugin API and throws on 0.99.
export default defineConfig({
  input: "../specs/bundled/catalogs.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  plugins: [
    { name: "@hey-api/client-fetch" },
    { name: "@hey-api/typescript" },
    { name: "@hey-api/sdk" },
    {
      $resolvers: { number: int64AsNumber },
      compatibilityVersion: 3,
      name: "zod",
    },
  ],
})
