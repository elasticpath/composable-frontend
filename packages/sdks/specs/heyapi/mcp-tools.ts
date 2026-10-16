import type { $ as Dsl, DefinePlugin, IR } from "@hey-api/openapi-ts"
import fs from "node:fs"
import { EOL } from "node:os"
import path from "node:path"

type RiskTier = "read" | "create" | "update" | "delete"
type McpToolsPlugin = DefinePlugin<{ includeInEntry: boolean; name: "mcp" }>

const RISK_TIERS: ReadonlyArray<RiskTier> = [
  "read",
  "create",
  "update",
  "delete",
]
const TOOL_NAME = /^[a-zA-Z0-9_-]{1,64}$/
const OPERATION = "com.elasticpath/operation"
const SUPPORT = "mcp-support.gen"
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
    idempotentHint: risk === "read" || ["PUT", "DELETE"].includes(method),
    openWorldHint: true,
  }
}

const isAuthorization = (name: string) => name.toLowerCase() === "authorization"

const isJson = (mediaType: string) =>
  /^application\/(?:[^;]*\+)?json\s*(?:;|$)/i.test(mediaType.trim())

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

export function mcpTools($: typeof Dsl, options: { api: string }) {
  const handler: McpToolsPlugin["Handler"] = ({ plugin }) => {
    const support = path.resolve(plugin.context.config.output.path, SUPPORT)
    if (!plugin.context.config.dryRun) {
      fs.mkdirSync(path.dirname(support), { recursive: true })
      fs.copyFileSync(
        new URL("./mcp-tools-support.ts", import.meta.url),
        `${support}.ts`,
      )
    }
    const z = plugin.symbol("z", { external: "zod" })
    const toolCallback = plugin.symbol("ToolCallback", {
      external: "@modelcontextprotocol/sdk/server/mcp.js",
      kind: "type",
    })
    const toolType = plugin.symbol("Tool", { external: support, kind: "type" })
    const toToolResult = plugin.symbol("toToolResult", { external: support })
    const loose = plugin.symbol("loose", { external: support })
    const clientType = plugin.querySymbol({ resource: "client.Client" })
    if (!clientType) throw new Error("@hey-api/sdk wrote no Client type")

    const toolOptions = plugin.symbol("ToolOptions", { kind: "type" })
    plugin.node(
      $.type
        .alias(toolOptions)
        .type(
          $.type
            .object()
            .prop("client", (p) => p.optional().type($.type(clientType))),
        ),
    )
    let tools = $.array().pretty()

    plugin.forEach(
      "operation",
      ({ operation }) => {
        if (operation.body && !isJson(operation.body.mediaType)) return
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
          let value = section === "body" ? $(loose).call($(schema)) : $(schema)
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
        const text = operation.description?.trim() || title
        const description =
          operation.deprecated && !/^deprecated\b/i.test(text)
            ? `Deprecated. ${text}`
            : text
        const inputSchema = plugin.symbol(`${sdkFunction.name}Input`)
        plugin.node(
          $.const(inputSchema).assign(
            $(z).attr("object").call(input).attr("strict").call(),
          ),
        )

        const config = {
          title,
          description,
          inputSchema: $(inputSchema),
          annotations: annotationsOf(risk, method),
          _meta: {
            [OPERATION]: {
              id: `${options.api}.${sdkFunction.name}`,
              method,
              path: operation.path,
              risk: $.as($.literal(risk), "const"),
            },
          },
        }

        const tool = plugin.symbol(`${sdkFunction.name}Tool`, {
          exported: true,
        })
        plugin.node(
          $.const(tool)
            .export()
            .$if(docOf(operation), (node, lines) => node.doc(lines))
            .assign(
              $.func()
                .arrow()
                .param("options", (p) => p.optional().type($.type(toolOptions)))
                .do(
                  $.const("handler")
                    .type(
                      $.type(toolCallback).generic(
                        $.type.query($(inputSchema)),
                      ),
                    )
                    .assign(
                      $.func()
                        .arrow()
                        .param("args")
                        .param("extra")
                        .do(
                          $.return(
                            $(toToolResult).call(
                              $(sdkFunction).call(
                                $.object()
                                  .spread($("args"))
                                  .prop(
                                    "client",
                                    $("options").attr("client").optional(),
                                  )
                                  .prop("signal", $("extra").attr("signal"))
                                  .prop("throwOnError", $.literal(false)),
                              ),
                            ),
                          ),
                        ),
                    ),
                  $.return(
                    $.fromValue(
                      {
                        name: $.as($.literal(name), "const"),
                        config,
                        handler: $("handler"),
                      },
                      { layout: "pretty" },
                    ),
                  ),
                ),
            ),
        )
        tools = tools.element($(tool).call($("options")))
      },
      { order: "declarations" },
    )

    const toolsSymbol = plugin.symbol("tools", { exported: true })
    plugin.node(
      $.const(toolsSymbol)
        .export()
        .assign(
          $.func()
            .arrow()
            .param("options", (p) => p.optional().type($.type(toolOptions)))
            .returns($.type("Array").generic($.type(toolType)))
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
