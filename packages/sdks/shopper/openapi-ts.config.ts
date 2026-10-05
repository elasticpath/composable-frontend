import { defineConfig } from "@hey-api/openapi-ts"

type SchemaNode = Record<string, unknown>

const annotationsAllowedBesideRef = new Set([
  "$ref",
  "description",
  "readOnly",
  "writeOnly",
])

function isObject(value: unknown): value is SchemaNode {
  return typeof value === "object" && value !== null
}

function isBareObjectSchema(node: SchemaNode) {
  return (
    node.type === "object" &&
    node.properties === undefined &&
    node.additionalProperties === undefined &&
    node.allOf === undefined &&
    node.oneOf === undefined &&
    node.anyOf === undefined
  )
}

function hasDefaultOutsideEnum(node: SchemaNode) {
  return (
    Array.isArray(node.enum) &&
    "default" in node &&
    !node.enum.includes(node.default)
  )
}

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

function normaliseForReadWriteSplit(node: unknown): void {
  if (!isObject(node)) return
  if (typeof node.$ref === "string") {
    for (const key of Object.keys(node)) {
      if (!annotationsAllowedBesideRef.has(key)) delete node[key]
    }
  }
  if (isBareObjectSchema(node)) node.additionalProperties = true
  if (hasDefaultOutsideEnum(node)) delete node.default
  for (const child of Object.values(node)) normaliseForReadWriteSplit(child)
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
    { name: "@tanstack/react-query" },
  ],
})
