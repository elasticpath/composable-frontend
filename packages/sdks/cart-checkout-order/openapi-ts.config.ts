import { defineConfig } from "@hey-api/openapi-ts"

type SchemaNode = Record<string, unknown>

function allowOrderItemsWithoutAProduct(orderItem: SchemaNode) {
  const properties = orderItem.properties as SchemaNode
  delete (properties.product_id as SchemaNode).format
}

const cartCheckoutServiceCorrections: Record<
  string,
  (schema: SchemaNode) => void
> = {
  OrderItemResponse: allowOrderItemsWithoutAProduct,
}

export default defineConfig({
  input: "../specs/bundled/cart_checkout_standalone.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  parser: {
    patch: {
      schemas: (name, schema) => {
        cartCheckoutServiceCorrections[name]?.(schema as SchemaNode)
      },
    },
    transforms: { readWrite: false },
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
