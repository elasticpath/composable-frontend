import { $, defineConfig } from "@hey-api/openapi-ts"
import { int64AsNumber } from "../specs/heyapi/int64-as-number"
import { mcpTools } from "../specs/heyapi/mcp-tools"

// @hey-api/transformers is deliberately absent: it types date-time as Date and int64 as bigint
// while nothing wires the transformers in.
export default defineConfig({
  input: "../specs/bundled/catalogs.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  plugins: [
    { name: "@hey-api/client-fetch" },
    { name: "@hey-api/typescript" },
    { name: "@hey-api/sdk" },
    {
      $resolvers: { number: int64AsNumber },
      metadata: true,
      name: "zod",
    },
    mcpTools($, { api: "catalogs" }),
  ],
})
