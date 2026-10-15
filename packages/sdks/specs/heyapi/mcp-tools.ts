import type { $ as Dsl, DefinePlugin, IR } from "@hey-api/openapi-ts"

type RiskTier = "read" | "create" | "update" | "delete"
type InputSection = "path" | "query" | "headers" | "body"
type Location = "path" | "query" | "header"
type McpToolsPlugin = DefinePlugin<{ includeInEntry: boolean; name: "mcp" }>

export interface McpToolsOptions {
  api: string
}

export const RISK_EXTENSION = "x-mcp-risk"
export const IDEMPOTENT_EXTENSION = "x-mcp-idempotent"
export const AGENT_UNSAFE_EXTENSION = "x-mcp-agent-unsafe"

export const mcpPagingKeywords = ["page\\[limit\\]", "page\\[offset\\]"]

const PAGING_ROLE = /^page\[(limit|offset)\]$/
const RISK_TIERS: ReadonlyArray<RiskTier> = [
  "read",
  "create",
  "update",
  "delete",
]
const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"])
const REPEATABLE_METHODS = new Set(["PUT", "DELETE"])
const SECTION_OF: Record<Location, InputSection> = {
  path: "path",
  query: "query",
  header: "headers",
}
const BINDING_ROLES: ReadonlyArray<[string, string]> = [
  ["request-path", "path"],
  ["request-query", "query"],
  ["request-headers", "headers"],
  ["request-body", "body"],
  ["responses", "response"],
]

const isAuthorization = (parameter: IR.ParameterObject) =>
  parameter.location === "header" &&
  parameter.name.toLowerCase() === "authorization"

const parametersAt = (operation: IR.OperationObject, location: Location) =>
  Object.values(operation.parameters?.[location] ?? {}).filter(
    (parameter) => !isAuthorization(parameter),
  )

function riskOf(operation: IR.OperationObject, method: string): RiskTier {
  const override = operation[RISK_EXTENSION]
  if (override !== undefined) {
    if (!RISK_TIERS.includes(override as RiskTier)) {
      throw new Error(
        `${operation.id} has ${RISK_EXTENSION}: ${String(
          override,
        )}; use one of ${RISK_TIERS.join(", ")}`,
      )
    }
    return override as RiskTier
  }
  if (READ_METHODS.has(method)) return "read"
  if (method === "DELETE") return "delete"
  if (method === "PUT" || method === "PATCH") return "update"
  return "create"
}

function flag(operation: IR.OperationObject, extension: `x-${string}`) {
  const value = operation[extension]
  if (value === undefined) return undefined
  if (typeof value !== "boolean") {
    throw new Error(
      `${operation.id} has ${extension}: ${String(value)}; use true or false`,
    )
  }
  return value
}

function pagingOf(operation: IR.OperationObject) {
  const paging: Record<string, string> = {}
  for (const parameter of parametersAt(operation, "query")) {
    const role = parameter.pagination && PAGING_ROLE.exec(parameter.name)?.[1]
    if (role) paging[role] = parameter.name
  }
  return Object.keys(paging).length > 0 ? paging : null
}

function requiredSectionsOf(operation: IR.OperationObject): InputSection[] {
  const sections: InputSection[] = []
  for (const location of ["path", "query", "header"] as const) {
    const parameters = parametersAt(operation, location)
    const required = parameters.some(
      (parameter) => parameter.required || location === "path",
    )
    if (required) sections.push(SECTION_OF[location])
  }
  if (operation.body?.required) sections.push("body")
  return sections
}

function factsOf(
  operation: IR.OperationObject,
  api: string,
  functionName: string,
) {
  const method = operation.method.toUpperCase()
  const risk = riskOf(operation, method)
  const title = operation.summary?.trim() || functionName
  return {
    id: `${api}.${functionName}`,
    method,
    path: operation.path,
    title,
    description: operation.description?.trim() || title,
    risk,
    idempotent:
      flag(operation, IDEMPOTENT_EXTENSION) ??
      (risk === "read" || REPEATABLE_METHODS.has(method)),
    paging: pagingOf(operation),
    deprecated: Boolean(operation.deprecated),
    agentUnsafe: flag(operation, AGENT_UNSAFE_EXTENSION) ?? false,
    requiredSections: requiredSectionsOf(operation),
  }
}

export function mcpTools($: typeof Dsl, options: McpToolsOptions) {
  const handler: McpToolsPlugin["Handler"] = ({ plugin }) => {
    let operations = $.array().pretty()

    plugin.forEach(
      "operation",
      ({ operation }) => {
        const sdkFunction = plugin.querySymbol({
          category: "sdk",
          resource: "operation",
          resourceId: operation.id,
        })
        if (!sdkFunction) {
          throw new Error(`@hey-api/sdk wrote no function for ${operation.id}`)
        }

        let bindings = $.object().pretty().prop("fn", $(sdkFunction))
        for (const [role, key] of BINDING_ROLES) {
          const schema = plugin.querySymbol({
            category: "schema",
            resource: "operation",
            resourceId: operation.id,
            role,
            artifact: "zod",
          })
          if (schema) bindings = bindings.prop(key, $(schema))
        }

        const facts = factsOf(operation, options.api, sdkFunction.name)
        operations = operations.element(
          $.object()
            .pretty()
            .prop("facts", $.fromValue(facts, { layout: "pretty" }))
            .prop("bindings", bindings),
        )
      },
      { order: "declarations" },
    )

    const endpointOperation = plugin.symbol("EndpointOperation", {
      external: "@epcc-sdk/sdks-runtime/mcp",
      kind: "type",
    })
    const exported = plugin.symbol("operations", { exported: true })
    plugin.node(
      $.const(exported)
        .export()
        .type($.type.expr("ReadonlyArray").generic($.type(endpointOperation)))
        .assign(operations),
    )
  }

  const plugin: McpToolsPlugin["Config"] = {
    config: { includeInEntry: false },
    dependencies: ["@hey-api/sdk", "zod"],
    handler,
    name: "mcp",
  }
  return plugin as Omit<McpToolsPlugin["Config"], "name"> & { name: any }
}
