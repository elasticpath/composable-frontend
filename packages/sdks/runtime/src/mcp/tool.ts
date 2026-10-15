import type { Tool } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"
import type { ZodObject, ZodType } from "zod"
import type {
  BuildToolsOptions,
  EndpointOperation,
  InputSection,
  OperationFacts,
  ToolOptions,
} from "./types"

export const MAX_DESCRIPTION_LENGTH = 2048
export const OPERATION_META_KEY = "com.elasticpath/operation"

const TOOL_NAME = /^[a-zA-Z0-9_-]{1,64}$/
const INPUT_SECTIONS: ReadonlyArray<InputSection> = [
  "path",
  "query",
  "headers",
  "body",
]

type JsonSchemaObject = Tool["inputSchema"]

const snakeCase = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase()

export function toolName(facts: Pick<OperationFacts, "id">): string {
  const separator = facts.id.indexOf(".")
  if (separator < 1) {
    throw new Error(`The operation id ${facts.id} is not <api>.<function>`)
  }
  const api = facts.id.slice(0, separator)
  const name = `${api}_${snakeCase(facts.id.slice(separator + 1))}`
  if (!TOOL_NAME.test(name)) {
    throw new Error(
      `The tool name "${name}" for ${facts.id} must be 1 to 64 characters of [a-zA-Z0-9_-]`,
    )
  }
  return name
}

const isObjectSchema = (schema: ZodType): schema is ZodObject =>
  schema._zod.def.type === "object"

export const isAuthorization = (header: string) =>
  header.toLowerCase() === "authorization"

function withoutAuthorization(headers: ZodObject): ZodObject | undefined {
  const entries = Object.entries(headers.shape)
  const sent = entries.filter(([header]) => !isAuthorization(header))
  if (sent.length === entries.length) return headers
  return sent.length > 0 ? z.object(Object.fromEntries(sent)) : undefined
}

function closedSection(
  operation: EndpointOperation,
  section: InputSection,
): ZodType | undefined {
  const schema = operation.bindings[section]
  if (!schema || section === "body" || !isObjectSchema(schema)) return schema
  const sent = section === "headers" ? withoutAuthorization(schema) : schema
  return sent?.strict()
}

const inputSchemas = new WeakMap<EndpointOperation, ZodObject>()

export function inputSchemaOf(operation: EndpointOperation): ZodObject {
  const cached = inputSchemas.get(operation)
  if (cached) return cached
  const shape: Record<string, ZodType> = {}
  for (const section of INPUT_SECTIONS) {
    const schema = closedSection(operation, section)
    if (!schema) continue
    shape[section] = operation.facts.requiredSections.includes(section)
      ? schema
      : schema.optional()
  }
  const schema = z.strictObject(shape)
  inputSchemas.set(operation, schema)
  return schema
}

function toJsonSchema(schema: ZodType): Record<string, unknown> {
  const json: Record<string, unknown> = z.toJSONSchema(schema, {
    target: "draft-2020-12",
    io: "input",
    reused: "ref",
  })
  delete json.$schema
  return json
}

const isJsonSchemaObject = (
  json: Record<string, unknown>,
): json is JsonSchemaObject => json.type === "object"

function outputSchemaOf(
  operation: EndpointOperation,
): JsonSchemaObject | undefined {
  const { response } = operation.bindings
  if (!response || response._zod.def.type === "void") return undefined
  const json = toJsonSchema(response)
  return isJsonSchemaObject(json) ? json : undefined
}

const cutDescription = (description: string) =>
  description.length <= MAX_DESCRIPTION_LENGTH
    ? description
    : `${description.slice(0, MAX_DESCRIPTION_LENGTH - 1)}…`

function annotationsOf({ risk, idempotent }: OperationFacts) {
  return {
    readOnlyHint: risk === "read",
    destructiveHint: risk === "update" || risk === "delete",
    idempotentHint: idempotent,
    openWorldHint: true,
  }
}

function operationMeta(facts: OperationFacts) {
  const {
    id,
    method,
    path,
    risk,
    idempotent,
    paging,
    deprecated,
    agentUnsafe,
  } = facts
  return { id, method, path, risk, idempotent, paging, deprecated, agentUnsafe }
}

export function buildTool(
  operation: EndpointOperation,
  options: Pick<ToolOptions, "outputSchema"> = {},
): Tool {
  const { facts } = operation
  const inputSchema = toJsonSchema(inputSchemaOf(operation)) as JsonSchemaObject
  const outputSchema = options.outputSchema
    ? outputSchemaOf(operation)
    : undefined
  return {
    name: toolName(facts),
    title: facts.title,
    description: cutDescription(facts.description),
    inputSchema,
    ...(outputSchema ? { outputSchema } : {}),
    annotations: annotationsOf(facts),
    _meta: { [OPERATION_META_KEY]: operationMeta(facts) },
  }
}

export function indexOperations(
  operations: ReadonlyArray<EndpointOperation>,
  options: Pick<BuildToolsOptions, "tools"> = {},
): Map<string, EndpointOperation> {
  const byName = new Map<string, EndpointOperation>()
  for (const operation of operations) {
    const name = toolName(operation.facts)
    const taken = byName.get(name)
    if (taken) {
      throw new Error(
        `${operation.facts.id} and ${taken.facts.id} both give the tool name ${name}`,
      )
    }
    byName.set(name, operation)
  }
  const unknown = Object.keys(options.tools ?? {}).filter(
    (name) => !byName.has(name),
  )
  if (unknown.length > 0) {
    throw new Error(
      `Options name tools that do not exist: ${unknown.join(", ")}`,
    )
  }
  return byName
}

export const wantsOutputSchema = (
  name: string,
  options: BuildToolsOptions,
): boolean =>
  options.tools?.[name]?.outputSchema ?? options.outputSchema ?? false

export function buildTools(
  operations: ReadonlyArray<EndpointOperation>,
  options: BuildToolsOptions = {},
): Tool[] {
  return [...indexOperations(operations, options)].map(([name, operation]) =>
    buildTool(operation, { outputSchema: wantsOutputSchema(name, options) }),
  )
}
