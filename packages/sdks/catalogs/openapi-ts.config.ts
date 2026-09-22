import { defineConfig } from "@hey-api/openapi-ts"

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
    { compatibilityVersion: 3, name: "zod" },
  ],
})
