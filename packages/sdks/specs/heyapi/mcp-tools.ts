import type { $ as Dsl, DefinePlugin, IR } from "@hey-api/openapi-ts"

type RiskTier = "read" | "create" | "update" | "delete"
type McpToolsPlugin = DefinePlugin<{ includeInEntry: boolean; name: "mcp" }>

const RISK_TIERS: ReadonlyArray<RiskTier> = [
  "read",
  "create",
  "update",
  "delete",
]
const TOOL_NAME = /^[a-zA-Z0-9_-]{1,64}$/
const MAX_DESCRIPTION = 2048
const SECTIONS = [
  ["path", "request-path"],
  ["query", "request-query"],
  ["headers", "request-headers"],
  ["body", "request-body"],
] as const

const toolNameOf = (api: string, functionName: string) =>
  `${api}_${functionName.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()}`

function riskOf(operation: IR.OperationObject, method: string): RiskTier {
  const override = operation["x-mcp-risk"]
  if (override !== undefined) {
    if (!RISK_TIERS.includes(override as RiskTier)) {
      throw new Error(
        `${operation.id} has x-mcp-risk: ${String(
          override,
        )}; use one of ${RISK_TIERS.join(", ")}`,
      )
    }
    return override as RiskTier
  }
  if (method === "GET") return "read"
  if (method === "DELETE") return "delete"
  if (method === "PUT" || method === "PATCH") return "update"
  return "create"
}

function annotationsOf(risk: RiskTier, method: string) {
  return {
    readOnlyHint: risk === "read",
    destructiveHint: risk === "update" || risk === "delete",
    idempotentHint:
      risk === "read" || ["GET", "PUT", "DELETE"].includes(method),
    openWorldHint: true,
  }
}

function pagingOf(operation: IR.OperationObject) {
  const names = Object.values(operation.parameters?.query ?? {}).map(
    (parameter) => parameter.name,
  )
  const paging: Record<string, string> = {}
  if (names.includes("page[offset]")) paging.offset = "page[offset]"
  if (names.includes("page[limit]")) paging.limit = "page[limit]"
  return Object.keys(paging).length > 0 ? paging : null
}

const isAuthorization = (name: string) => name.toLowerCase() === "authorization"

function requiredSection(operation: IR.OperationObject, section: string) {
  if (section === "path") return true
  if (section === "body") return Boolean(operation.body?.required)
  const location = section === "headers" ? "header" : "query"
  return Object.values(operation.parameters?.[location] ?? {}).some(
    (parameter) => parameter.required && !isAuthorization(parameter.name),
  )
}

export function mcpTools($: typeof Dsl, options: { api: string }) {
  const handler: McpToolsPlugin["Handler"] = ({ plugin }) => {
    const z = plugin.symbol("z", { external: "zod" })
    const callSdk = plugin.symbol("callSdk", { external: "@epcc-sdk/sdks-mcp" })
    const endpointTool = plugin.symbol("EndpointTool", {
      external: "@epcc-sdk/sdks-mcp",
      kind: "type",
    })
    const clientType = plugin.querySymbol({ resource: "client.Client" })
    let tools = $.array().pretty()

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

        let input = $.object().pretty()
        for (const [section, role] of SECTIONS) {
          const schema = plugin.querySymbol({
            category: "schema",
            resource: "operation",
            resourceId: operation.id,
            role,
            artifact: "zod",
          })
          if (!schema) continue
          let value = $(schema)
          if (section === "headers") {
            const headers = Object.values(
              operation.parameters?.header ?? {},
            ).map((parameter) => parameter.name)
            const authorization = headers.filter(isAuthorization)
            if (authorization.length === headers.length) continue
            if (authorization.length > 0) {
              value = value
                .attr("omit")
                .call(
                  $.fromValue(
                    Object.fromEntries(
                      authorization.map((name) => [name, true]),
                    ),
                  ),
                )
            }
          }
          if (section !== "body") value = value.attr("strict").call()
          if (!requiredSection(operation, section)) {
            value = value.attr("optional").call()
          }
          input = input.prop(section, value)
        }

        const method = operation.method.toUpperCase()
        const risk = riskOf(operation, method)
        const name = toolNameOf(options.api, sdkFunction.name)
        if (!TOOL_NAME.test(name)) {
          throw new Error(`${operation.id} gives the invalid tool name ${name}`)
        }
        const title = operation.summary?.trim() || sdkFunction.name
        const description = (operation.description?.trim() || title).slice(
          0,
          MAX_DESCRIPTION,
        )
        const meta = {
          "com.elasticpath/operation": {
            id: `${options.api}.${sdkFunction.name}`,
            method,
            path: operation.path,
            risk,
            paging: pagingOf(operation),
            deprecated: Boolean(operation.deprecated),
          },
        }

        const config = $.object()
          .pretty()
          .prop("title", $.literal(title))
          .prop("description", $.literal(description))
          .prop(
            "inputSchema",
            $(z).attr("object").call(input).attr("strict").call(),
          )
          .prop(
            "annotations",
            $.fromValue(annotationsOf(risk, method), { layout: "pretty" }),
          )
          .prop("_meta", $.fromValue(meta, { layout: "pretty" }))

        tools = tools.element(
          $.object()
            .pretty()
            .prop("name", $.literal(name))
            .prop("config", config)
            .prop(
              "handler",
              $.func()
                .arrow()
                .param("args")
                .do(
                  $.return(
                    $(callSdk).call($(sdkFunction), $("client"), $("args")),
                  ),
                ),
            ),
        )
      },
      { order: "declarations" },
    )

    const createTools = plugin.symbol("createTools", { exported: true })
    plugin.node(
      $.const(createTools)
        .export()
        .assign(
          $.func()
            .arrow()
            .param("client", (p) => (clientType ? p.type(clientType) : p))
            .returns($.type.expr("Array").generic($.type(endpointTool)))
            .do($.return(tools)),
        ),
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
