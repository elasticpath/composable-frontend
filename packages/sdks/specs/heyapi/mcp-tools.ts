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
  `${api}_${functionName
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase()}`

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

function overrideOf(
  operation: IR.OperationObject,
  extension: `x-mcp-${string}`,
) {
  const value = operation[extension]
  if (value === undefined) return undefined
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${operation.id} needs text in ${extension}`)
  }
  return value.trim()
}

const DEPRECATION_NOTICE = /^deprecated[.:]\s*/i

const withoutEndPunctuation = (text: string) =>
  text.replace(/[.!?]+$/, "").toLowerCase()

const firstParagraphOf = (text: string) =>
  text
    .trim()
    .split(/\r?\n\s*\r?\n/)[0]!
    .replace(/\s+/g, " ")

function defaultDescriptionOf(operation: IR.OperationObject) {
  const summary = operation.summary?.trim()
  let paragraph = firstParagraphOf(operation.description ?? "")
  if (operation.deprecated) {
    paragraph = paragraph.replace(DEPRECATION_NOTICE, "")
  }
  if (!summary) return paragraph || undefined
  if (!paragraph) return summary
  if (withoutEndPunctuation(summary) === withoutEndPunctuation(paragraph)) {
    return paragraph
  }
  const separator = /[.!?]$/.test(summary) ? " " : ". "
  return `${summary}${separator}${paragraph}`
}

function descriptionOf(operation: IR.OperationObject, fallback: string) {
  const text =
    overrideOf(operation, "x-mcp-description") ??
    defaultDescriptionOf(operation) ??
    fallback
  return operation.deprecated && !/^deprecated\b/i.test(text)
    ? `Deprecated. ${text}`
    : text
}

const isAuthorization = (name: string) => name.toLowerCase() === "authorization"

const isJson = (mediaType: string) =>
  /^application\/(?:[^;]*\+)?json\s*(?:;|$)/i.test(mediaType.trim())

const isMultipart = (mediaType: string) =>
  /^multipart\/form-data\s*(?:;|$)/i.test(mediaType.trim())

function maxFileBytesOf(operation: IR.OperationObject) {
  const value = operation["x-mcp-max-file-bytes"]
  if (value === undefined) {
    throw new Error(`${operation.id} uploads a file; set x-mcp-max-file-bytes`)
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(
      `${operation.id} needs a whole number of bytes above 0 in x-mcp-max-file-bytes`,
    )
  }
  return value
}

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
      external: "@modelcontextprotocol/server",
      kind: "type",
    })
    const toolType = plugin.symbol("Tool", { external: support, kind: "type" })
    const toToolResult = plugin.symbol("toToolResult", { external: support })
    const loose = plugin.symbol("loose", { external: support })
    const withSharedSchemaIds = plugin.symbol("withSharedSchemaIds", {
      external: support,
    })
    const dataUriFields = plugin.symbol("dataUriFields", { external: support })
    const decodeDataUris = plugin.symbol("decodeDataUris", {
      external: support,
    })
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

    const fileFieldsOf = (operation: IR.OperationObject) => {
      if (!operation.body || !isMultipart(operation.body.mediaType)) return []
      const schema = operation.body.schema.$ref
        ? plugin.context.resolveIrRef<IR.SchemaObject>(
            operation.body.schema.$ref,
          )
        : operation.body.schema
      const fields = Object.entries(schema.properties ?? {})
        .filter(
          ([, property]) =>
            property.type === "string" && property.format === "binary",
        )
        .map(([name]) => name)
      for (const field of fields) {
        if (schema.properties?.[`${field}_name`]) {
          throw new Error(
            `${operation.id} already has a ${field}_name field, so the name of ${field} has nowhere to go`,
          )
        }
      }
      return fields
    }

    plugin.forEach(
      "operation",
      ({ operation }) => {
        if (
          operation.body &&
          !isJson(operation.body.mediaType) &&
          !isMultipart(operation.body.mediaType)
        ) {
          return
        }
        const fileFields = fileFieldsOf(operation)
        const upload = fileFields.length
          ? { fields: fileFields, maxBytes: maxFileBytesOf(operation) }
          : undefined
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
          if (section === "body" && upload) {
            value = $(dataUriFields).call(
              value,
              $.fromValue(upload.fields),
              $.literal(upload.maxBytes),
            )
          }
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
        const nameOverride = overrideOf(operation, "x-mcp-name")
        const name = nameOverride ?? toolNameOf(options.api, sdkFunction.name)
        if (!TOOL_NAME.test(name)) {
          throw new Error(
            `${operation.id} gives the invalid tool name ${name}${
              nameOverride ? "" : "; set x-mcp-name"
            }`,
          )
        }
        const title =
          overrideOf(operation, "x-mcp-title") ??
          (operation.summary?.trim() || sdkFunction.name)
        const description = descriptionOf(operation, title)
        const inputSchema = plugin.symbol(`${sdkFunction.name}Input`)
        const strictInput = $(z)
          .attr("object")
          .call(input)
          .attr("strict")
          .call()
        plugin.node(
          $.const(inputSchema).assign(
            operation.body
              ? $(withSharedSchemaIds).call($.literal(options.api), strictInput)
              : strictInput,
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

        const requestOptions = () =>
          $.object()
            .spread($("args"))
            .prop("client", $("options").attr("client").optional())
            .prop("signal", $("ctx").attr("mcpReq").attr("signal"))
            .prop("throwOnError", $.literal(false))

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
                        .param("ctx")
                        .do(
                          $.return(
                            $(toToolResult).call(
                              upload
                                ? $(decodeDataUris)
                                    .call(
                                      $("args").attr("body"),
                                      $.fromValue(upload.fields),
                                      $.literal(upload.maxBytes),
                                    )
                                    .attr("then")
                                    .call(
                                      $.func()
                                        .arrow()
                                        .param("body")
                                        .do(
                                          $.return(
                                            $(sdkFunction).call(
                                              requestOptions().prop(
                                                "body",
                                                $("body"),
                                              ),
                                            ),
                                          ),
                                        ),
                                    )
                                : $(sdkFunction).call(requestOptions()),
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
