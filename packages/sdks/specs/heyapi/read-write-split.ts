export type SchemaNode = Record<string, unknown>

const annotationsAllowedBesideRef = new Set([
  "$ref",
  "description",
  "readOnly",
  "writeOnly",
])

export function isObject(value: unknown): value is SchemaNode {
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

export function normaliseForReadWriteSplit(node: unknown): void {
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
