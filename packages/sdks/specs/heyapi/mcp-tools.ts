import type { $ as Dsl, DefinePlugin, IR } from "@hey-api/openapi-ts"
import type TypeScript from "typescript"
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
const OPERATION = "com.elasticpath/operation"
const MCP_SDK = "@modelcontextprotocol/sdk"
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

function satisfiesOf($: typeof Dsl, ts: typeof TypeScript) {
  const AsDsl = $.as("value", "type").constructor as new (
    expr: unknown,
    type: unknown,
  ) => { toAst(): TypeScript.AsExpression }
  class SatisfiesDsl extends AsDsl {
    toAst() {
      const node = super.toAst()
      return ts.factory.createSatisfiesExpression(
        node.expression,
        node.type,
      ) as unknown as TypeScript.AsExpression
    }
  }
  return (expr: unknown, type: unknown) =>
    new SatisfiesDsl(expr, type) as unknown as ReturnType<typeof $.as>
}

export function mcpTools(
  $: typeof Dsl,
  ts: typeof TypeScript,
  options: { api: string },
) {
  const satisfies = satisfiesOf($, ts)

  const handler: McpToolsPlugin["Handler"] = ({ plugin }) => {
    const z = plugin.symbol("z", { external: "zod" })
    const typeFrom = (name: string, external: string) =>
      plugin.symbol(name, { external, kind: "type" })
    const toolCallback = typeFrom("ToolCallback", `${MCP_SDK}/server/mcp.js`)
    const anySchema = typeFrom("AnySchema", `${MCP_SDK}/server/zod-compat.js`)
    const callToolResult = typeFrom("CallToolResult", `${MCP_SDK}/types.js`)
    const toolAnnotations = typeFrom("ToolAnnotations", `${MCP_SDK}/types.js`)
    const clientType = plugin.querySymbol({ resource: "client.Client" })
    if (!clientType) throw new Error("@hey-api/sdk wrote no Client type")

    const operationMeta = plugin.symbol("OperationMeta", {
      exported: true,
      kind: "type",
    })
    const toolConfig = plugin.symbol("ToolConfig", {
      exported: true,
      kind: "type",
    })
    const toolType = plugin.symbol("Tool", { exported: true, kind: "type" })
    const toToolResult = plugin.symbol("toToolResult")
    const loose = plugin.symbol("loose")

    plugin.node(
      $.type
        .alias(operationMeta)
        .export()
        .type(
          $.type
            .object()
            .prop("id", (p) => p.type("string"))
            .prop("method", (p) => p.type("string"))
            .prop("path", (p) => p.type("string"))
            .prop("risk", (p) =>
              p.type($.type.or(...RISK_TIERS.map((t) => $.type.literal(t)))),
            ),
        ),
    )
    plugin.node(
      $.type
        .alias(toolConfig)
        .export()
        .type(
          $.type
            .object()
            .prop("title", (p) => p.optional().type("string"))
            .prop("description", (p) => p.optional().type("string"))
            .prop("inputSchema", (p) =>
              p.type(
                $.type(z)
                  .attr("ZodObject")
                  .generic(
                    $.type("Record").generics(
                      "string",
                      $.type(z).attr("ZodType").generic("any"),
                    ),
                  ),
              ),
            )
            .prop("outputSchema", (p) => p.optional().type($.type(anySchema)))
            .prop("annotations", (p) =>
              p.optional().type($.type(toolAnnotations)),
            )
            .prop("_meta", (p) =>
              p.type(
                $.type
                  .object()
                  .prop(OPERATION, (q) => q.type($.type(operationMeta))),
              ),
            ),
        ),
    )
    plugin.node(
      $.type
        .alias(toolType)
        .export()
        .type(
          $.type
            .object()
            .prop("name", (p) => p.readonly().type("string"))
            .prop("config", (p) => p.readonly().type($.type(toolConfig)))
            .prop("handler", (p) =>
              p
                .readonly()
                .type($.type(toolCallback).generic($.type(anySchema))),
            ),
        ),
    )

    const textContent = (text: Parameters<typeof $.object>[0] | unknown) =>
      $.array(
        $.object()
          .prop("type", $.literal("text"))
          .prop("text", text as never),
      )
    const result = (name: string) => $("result").attr(name)
    const every = (
      op: "&&" | "||",
      ...exprs: Array<ReturnType<typeof $.binary>>
    ) => exprs.reduce((left, right) => $.binary(left, op, right))
    plugin.node(
      $.const(toToolResult).assign(
        $.func()
          .arrow()
          .async()
          .param("request", (p) =>
            p.type(
              $.type("Promise").generic(
                $.type
                  .object()
                  .prop("data", (q) => q.optional().type("unknown"))
                  .prop("error", (q) => q.optional().type("unknown"))
                  .prop("response", (q) => q.optional().type("Response")),
              ),
            ),
          )
          .returns($.type("Promise").generic($.type(callToolResult)))
          .do(
            $.let("text").type("string"),
            $.try(
              $.const("result").assign($.await($("request"))),
              $.if(result("error").eq($("undefined"))).do(
                $.const("structuredContent").assign(
                  $.ternary(
                    every(
                      "&&",
                      $.typeofExpr(result("data")).eq($.literal("object")),
                      result("data").neq($.literal(null)),
                      $.not($("Array").attr("isArray").call(result("data"))),
                    ),
                  )
                    .do(
                      $.as(
                        result("data"),
                        $.type("Record").generics("string", "unknown"),
                      ),
                    )
                    .otherwise(
                      $.object().prop(
                        "data",
                        result("data").coalesce($.literal(null)),
                      ),
                    ),
                ),
                $.return(
                  $.object()
                    .prop("structuredContent", $("structuredContent"))
                    .prop(
                      "content",
                      textContent(
                        $("JSON")
                          .attr("stringify")
                          .call($("structuredContent")),
                      ),
                    ),
                ),
              ),
              $("text").assign(
                $.ternary(result("response"))
                  .do(
                    $.template("HTTP ")
                      .add(result("response").attr("status"))
                      .add(": ")
                      .add($("JSON").attr("stringify").call(result("error"))),
                  )
                  .otherwise($("String").call(result("error"))),
              ),
            )
              .catchArg("error")
              .catch($("text").assign($("String").call($("error")))),
            $.return(
              $.object()
                .prop("isError", $.literal(true))
                .prop("content", textContent($("text"))),
            ),
          ),
      ),
    )

    const def = (name: string) => $("def").attr(name)
    const looseOf = (expr: ReturnType<typeof $>) => $(loose).call(expr)
    const copy = (changes: ReturnType<typeof $.object>) =>
      $.return($("copy").call(changes))
    plugin.node(
      $.const(loose).assign(
        $.func()
          .arrow()
          .generic("T", (g) => g.extends($.type(z).attr("ZodType")))
          .param("schema", (p) => p.type("T"))
          .returns("T")
          .do(
            $.const("def")
              .type("any")
              .assign($("schema").attr("_zod").attr("def")),
            $.const("copy").assign(
              $.func()
                .arrow()
                .param("changes", (p) => p.type("object"))
                .returns("T")
                .do(
                  $.return(
                    $("schema")
                      .attr("clone")
                      .call(
                        $.object().spread($("def")).spread($("changes")),
                        $.object().prop("parent", $.literal(true)),
                      ),
                  ),
                ),
            ),
            $.if(def("type").eq($.literal("object"))).do(
              copy(
                $.object()
                  .prop("catchall", $(z).attr("unknown").call())
                  .prop(
                    "shape",
                    $("Object")
                      .attr("fromEntries")
                      .call(
                        $("Object")
                          .attr("keys")
                          .call(def("shape"))
                          .attr("map")
                          .call(
                            $.func()
                              .arrow()
                              .param("key")
                              .do(
                                $.return(
                                  $.array(
                                    $("key"),
                                    looseOf(
                                      def("shape").attr("key").computed(),
                                    ),
                                  ),
                                ),
                              ),
                          ),
                      ),
                  ),
              ),
            ),
            $.if(def("type").eq($.literal("array"))).do(
              copy($.object().prop("element", looseOf(def("element")))),
            ),
            $.if(
              every(
                "||",
                ...["optional", "nullable", "default"].map((type) =>
                  def("type").eq($.literal(type)),
                ),
              ),
            ).do(copy($.object().prop("innerType", looseOf(def("innerType"))))),
            $.if(def("type").eq($.literal("union"))).do(
              copy(
                $.object().prop(
                  "options",
                  def("options").attr("map").call($(loose)),
                ),
              ),
            ),
            $.if(def("type").eq($.literal("intersection"))).do(
              copy(
                $.object()
                  .prop("left", looseOf(def("left")))
                  .prop("right", looseOf(def("right"))),
              ),
            ),
            $.return($("schema")),
          ),
      ),
    )

    const toolOptionsType = () =>
      $.type
        .object()
        .prop("client", (p) => p.optional().type($.type(clientType)))
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
          let value = section === "body" ? looseOf($(schema)) : $(schema)
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
        const description = operation.deprecated ? `Deprecated. ${text}` : text
        const meta = {
          [OPERATION]: {
            id: `${options.api}.${sdkFunction.name}`,
            method,
            path: operation.path,
            risk,
          },
        }

        const inputSchema = plugin.symbol(`${sdkFunction.name}Input`)
        plugin.node(
          $.const(inputSchema).assign(
            $(z).attr("object").call(input).attr("strict").call(),
          ),
        )

        const config = $.object()
          .pretty()
          .prop("title", $.literal(title))
          .prop("description", $.literal(description))
          .prop("inputSchema", $(inputSchema))
          .prop(
            "annotations",
            $.fromValue(annotationsOf(risk, method), { layout: "pretty" }),
          )
          .prop("_meta", $.fromValue(meta, { layout: "pretty" }))

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
                .param("options", (p) => p.optional().type(toolOptionsType()))
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
                    $.object()
                      .pretty()
                      .prop("name", $.as($.literal(name), "const"))
                      .prop("config", satisfies(config, $.type(toolConfig)))
                      .prop("handler", $("handler")),
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
            .param("options", (p) => p.optional().type(toolOptionsType()))
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
