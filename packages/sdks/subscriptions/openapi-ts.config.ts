import { $, defineConfig } from "@hey-api/openapi-ts"
import { int64AsNumber } from "../specs/heyapi/int64-as-number"
import { mcpTools } from "../specs/heyapi/mcp-tools"
import { nullableIntersection } from "../specs/heyapi/nullable-intersection"

export default defineConfig({
  input: "../specs/bundled/subscriptions_standalone.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  plugins: [
    {
      baseUrl: "https://euwest.api.elasticpath.com",
      name: "@hey-api/client-fetch",
    },
    {
      $resolvers: { intersection: nullableIntersection },
      name: "@hey-api/typescript",
    },
    { name: "@hey-api/sdk" },
    {
      $resolvers: { number: int64AsNumber },
      metadata: true,
      name: "zod",
    },
    mcpTools($, { api: "subscriptions" }),
  ],
})
