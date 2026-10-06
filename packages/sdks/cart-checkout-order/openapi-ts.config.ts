import { defineConfig } from "@hey-api/openapi-ts"
import { cartCheckoutServiceCorrections } from "../specs/heyapi/cart-checkout-service-corrections"
import {
  normaliseForReadWriteSplit,
  type SchemaNode,
} from "../specs/heyapi/read-write-split"

export default defineConfig({
  input: "../specs/bundled/cart_checkout_standalone.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  parser: {
    patch: {
      schemas: (name, schema) => {
        cartCheckoutServiceCorrections[name]?.(schema as SchemaNode)
        normaliseForReadWriteSplit(schema)
      },
    },
  },
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
