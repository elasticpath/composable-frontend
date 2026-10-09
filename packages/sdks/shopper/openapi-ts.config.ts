import { defineConfig } from "@hey-api/openapi-ts"
import { cartCheckoutServiceCorrections } from "../specs/heyapi/cart-checkout-service-corrections"
import {
  isObject,
  normaliseForReadWriteSplit,
  type SchemaNode,
} from "../specs/heyapi/read-write-split"
import { int64AsNumber } from "../specs/heyapi/int64-as-number"

function allowRelativeLinks(links: SchemaNode) {
  for (const link of Object.values(links.properties as SchemaNode)) {
    if (isObject(link) && link.format === "uri") delete link.format
  }
}

function allowAnyAttributeValue(extension: SchemaNode) {
  extension.additionalProperties = {}
}

const catalogViewServiceCorrections: Record<
  string,
  (schema: SchemaNode) => void
> = {
  links: allowRelativeLinks,
  extension: allowAnyAttributeValue,
}

export default defineConfig({
  input: "../specs/shopper.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  parser: {
    hooks: {
      operations: {
        getKind: (operation) =>
          operation.id === "postMultiSearch"
            ? ["query", "mutation"]
            : undefined,
      },
    },
    patch: {
      schemas: (name, schema) => {
        catalogViewServiceCorrections[name]?.(schema as SchemaNode)
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
    {
      $resolvers: { number: int64AsNumber },
      compatibilityVersion: 3,
      name: "zod",
    },
    { name: "@tanstack/react-query" },
  ],
})
