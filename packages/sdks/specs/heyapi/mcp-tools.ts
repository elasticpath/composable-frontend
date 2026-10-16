import type { $ as Dsl, DefinePlugin, IR } from "@hey-api/openapi-ts"
import { EOL } from "node:os"

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

const escapeComment = (value: string) =>
  value
    .replace(/\*\//g, "*")
    .replace(/\/\*/g, "*")
    .replace(/\r?\n(.*)/g, (_line, text: string) => EOL + text.trim())

function docOf(operation: IR.OperationObject) {
  const lines: string[] = []
  if (operation.summary) lines.push(escapeComment(operation.summary))
  if (operation.description) {
    if (lines.length) lines.push("")
    lines.push(escapeComment(operation.description))
  }
  if (operation.deprecated) {
    if (lines.length) lines.push("")
    lines.push("@deprecated")
  }
  return lines.length ? lines : undefined
}

function optionsRequired(operation: IR.OperationObject) {
  const groups = ["cookie", "header", "path", "query"] as const
  return (
    groups.some((group) =>
      Object.values(operation.parameters?.[group] ?? {}).some(
        (parameter) => parameter.required,
      ),
    ) || Boolean(operation.body?.required)
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
    const sdkOptions = plugin.querySymbol({
      artifact: "sdk",
      category: "type",
      resource: "client-options",
    })
    const clientType = plugin.querySymbol({ resource: "client.Client" })
    if (!sdkOptions || !clientType?.external) {
      throw new Error("@hey-api/sdk wrote no Options type or client module")
    }
    const dataShape = plugin.symbol("TDataShape", {
      external: clientType.external,
      kind: "type",
    })
    const toolOptions = plugin.symbol("ToolOptions", { kind: "type" })
    plugin.node(
      $.type
        .alias(toolOptions)
        .generic("TData", (g) => g.extends(dataShape))
        .type(
          $.type("Omit")
            .generic($.type(sdkOptions).generic("TData"))
            .generic($.type.literal("throwOnError")),
        ),
    )
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

        const dataType = plugin.querySymbol({
          artifact: "types",
          category: "type",
          resource: "operation",
          resourceId: operation.id,
          role: "data",
        })
        const tool = plugin.symbol(`${sdkFunction.name}Tool`, {
          exported: true,
        })
        plugin.node(
          $.const(tool)
            .export()
            .$if(docOf(operation), (node, lines) => node.doc(lines))
            .assign(
              $.object()
                .pretty()
                .prop("name", $.literal(name))
                .prop("config", config)
                .prop(
                  "call",
                  $.func()
                    .arrow()
                    .param("options", (p) =>
                      p
                        .required(optionsRequired(operation))
                        .type(
                          $.type(toolOptions).generic(dataType ?? "unknown"),
                        ),
                    )
                    .do(
                      $.return($(callSdk).call($(sdkFunction), $("options"))),
                    ),
                ),
            ),
        )
        tools = tools.element($(tool))
      },
      { order: "declarations" },
    )

    const toolsSymbol = plugin.symbol("tools", { exported: true })
    plugin.node(
      $.const(toolsSymbol)
        .export()
        .type($.type.expr("Array").generic($.type(endpointTool)))
        .assign(tools),
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
