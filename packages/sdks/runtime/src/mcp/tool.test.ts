import { describe, expect, it } from "vitest"
import { ToolSchema } from "@modelcontextprotocol/sdk/types.js"
import type { Tool } from "@modelcontextprotocol/sdk/types.js"
import { Ajv2020 } from "ajv/dist/2020.js"
import addFormats from "ajv-formats"
import {
  MAX_DESCRIPTION_LENGTH,
  OPERATION_META_KEY,
  buildTool,
  buildTools,
  toolName,
} from "./index"
import { widgetOperation, widgetOperations } from "./test/widgets"
import type { OperationFacts } from "./types"

type JsonSchema = Record<string, any>

function compile2020(schema: object) {
  const ajv = new Ajv2020({ strict: true, allowUnionTypes: true })
  addFormats(ajv)
  return ajv.compile(schema)
}

const factsWith = (overrides: Partial<OperationFacts>): OperationFacts => ({
  ...widgetOperation("widgets.listWidgets").facts,
  ...overrides,
})

describe("toolName", () => {
  it("joins the API and the snake-cased SDK function with an underscore", () => {
    expect(toolName(factsWith({ id: "widgets.listWidgets" }))).toBe(
      "widgets_list_widgets",
    )
  })

  it("keeps an acronym together as one word", () => {
    expect(toolName(factsWith({ id: "widgets.getWidgetByID" }))).toBe(
      "widgets_get_widget_by_id",
    )
    expect(toolName(factsWith({ id: "carts.getACart" }))).toBe(
      "carts_get_a_cart",
    )
  })

  it("rejects an id that is not <api>.<function>", () => {
    expect(() => toolName(factsWith({ id: "listWidgets" }))).toThrow(
      /<api>\.<function>/,
    )
  })

  it("rejects a name longer than 64 characters", () => {
    expect(() =>
      toolName(factsWith({ id: `widgets.${"getWidget".repeat(8)}` })),
    ).toThrow(/64 characters/)
  })

  it("rejects a name with a character outside [a-zA-Z0-9_-]", () => {
    expect(() => toolName(factsWith({ id: "widgets.get.widget" }))).toThrow(
      /\[a-zA-Z0-9_-\]/,
    )
  })
})

describe("buildTool", () => {
  it("uses the operation's title and description", () => {
    const tool = buildTool(widgetOperation("widgets.listWidgets"))

    expect(tool.name).toBe("widgets_list_widgets")
    expect(tool.title).toBe("List widgets")
    expect(tool.description).toBe("Does something with widgets.")
  })

  it("cuts a description longer than 2,048 characters to 2,048", () => {
    const operation = widgetOperation("widgets.listWidgets")
    const long = "Lists widgets. ".repeat(200)
    const tool = buildTool({
      ...operation,
      facts: { ...operation.facts, description: long },
    })

    expect(MAX_DESCRIPTION_LENGTH).toBe(2048)
    expect(tool.description).toHaveLength(2048)
    expect(long.startsWith(tool.description!.slice(0, -1))).toBe(true)
    expect(tool.description!.endsWith("…")).toBe(true)
  })

  it.each([
    ["widgets.listWidgets", "read", true, false, true],
    ["widgets.createWidget", "create", false, false, false],
    ["widgets.updateWidget", "update", false, true, true],
    ["widgets.deleteWidget", "delete", false, true, true],
  ])(
    "sets all four annotations for %s from its %s risk tier",
    (id, _risk, readOnlyHint, destructiveHint, idempotentHint) => {
      expect(buildTool(widgetOperation(id)).annotations).toEqual({
        readOnlyHint,
        destructiveHint,
        idempotentHint,
        openWorldHint: true,
      })
    },
  )

  it("puts the operation facts in _meta under one Elastic Path key", () => {
    const tool = buildTool(widgetOperation("widgets.listWidgets"))

    expect(OPERATION_META_KEY).toBe("com.elasticpath/operation")
    expect(tool._meta).toEqual({
      [OPERATION_META_KEY]: {
        id: "widgets.listWidgets",
        method: "GET",
        path: "/widgets",
        risk: "read",
        idempotent: true,
        paging: { limit: "page[limit]", offset: "page[offset]" },
        deprecated: false,
        agentUnsafe: false,
      },
    })
  })

  it("groups the inputs under path, query, headers and body, requiring only the required sections", () => {
    const { inputSchema } = buildTool(widgetOperation("widgets.updateWidget"))

    expect(inputSchema.type).toBe("object")
    expect(Object.keys(inputSchema.properties!)).toEqual(["path", "body"])
    expect(inputSchema.required).toEqual(["path", "body"])
    expect(inputSchema.additionalProperties).toBe(false)
  })

  it("closes the path, query and headers sections and leaves the body as the spec has it", () => {
    const list = buildTool(widgetOperation("widgets.listWidgets")).inputSchema
    const update = buildTool(widgetOperation("widgets.updateWidget"))
      .inputSchema as JsonSchema

    const properties = list.properties as JsonSchema
    expect(properties.query.additionalProperties).toBe(false)
    expect(properties.headers.additionalProperties).toBe(false)
    expect(update.properties.path.additionalProperties).toBe(false)
    expect(update.properties.body.additionalProperties).toBeUndefined()
  })

  it("leaves the Authorization header out of the tool", () => {
    const { inputSchema } = buildTool(widgetOperation("widgets.listWidgets"))
    const headers = (inputSchema.properties as JsonSchema).headers

    expect(Object.keys(headers.properties)).toEqual(["accept-language"])
    expect(inputSchema.required ?? []).not.toContain("headers")
  })

  it("writes the schema in JSON Schema 2020-12, with shared shapes under $defs", () => {
    const { inputSchema } = buildTool(widgetOperation("widgets.createWidget"))
    const body = (inputSchema.properties as JsonSchema).body

    expect(inputSchema.$schema).toBeUndefined()
    expect(Object.keys(inputSchema.$defs as object)).toHaveLength(1)
    expect(body.properties.price.$ref).toMatch(/^#\/\$defs\//)
    expect(body.properties.cost.$ref).toBe(body.properties.price.$ref)
  })

  it("carries the zod descriptions into the input schema", () => {
    const { inputSchema } = buildTool(widgetOperation("widgets.createWidget"))

    expect((inputSchema.properties as JsonSchema).body.properties.name).toEqual(
      { type: "string", description: "The widget's display name." },
    )
  })

  it("writes a 64-bit integer as an integer with only safe-integer bounds", () => {
    const { inputSchema } = buildTool(widgetOperation("widgets.listWidgets"))
    const query = (inputSchema.properties as JsonSchema).query

    expect(query.properties["page[limit]"]).toEqual({
      type: "integer",
      minimum: 1,
      maximum: Number.MAX_SAFE_INTEGER,
      description: "The maximum number of records per page.",
    })
    expect(query.properties["page[offset]"]).toEqual({
      type: "integer",
      minimum: 0,
      maximum: 10000,
    })
  })

  it("adds no outputSchema by default", () => {
    for (const operation of widgetOperations()) {
      expect(buildTool(operation)).not.toHaveProperty("outputSchema")
    }
  })

  it("adds the response as outputSchema when asked", () => {
    const { outputSchema } = buildTool(
      widgetOperation("widgets.getWidgetByID"),
      {
        outputSchema: true,
      },
    )

    expect(outputSchema?.type).toBe("object")
    expect(Object.keys(outputSchema!.properties!)).toEqual(["data"])
  })

  it("adds no outputSchema for a response with no body, even when asked", () => {
    const tool = buildTool(widgetOperation("widgets.deleteWidget"), {
      outputSchema: true,
    })

    expect(tool).not.toHaveProperty("outputSchema")
  })
})

describe("buildTools", () => {
  it("builds one tool per operation, in order", () => {
    expect(buildTools(widgetOperations()).map((tool) => tool.name)).toEqual([
      "widgets_list_widgets",
      "widgets_create_widget",
      "widgets_get_widget_by_id",
      "widgets_update_widget",
      "widgets_delete_widget",
    ])
  })

  it("adds outputSchema to every tool when asked for all of them", () => {
    const withOutput = buildTools(widgetOperations(), { outputSchema: true })
      .filter((tool) => tool.outputSchema)
      .map((tool) => tool.name)

    expect(withOutput).toHaveLength(4)
    expect(withOutput).not.toContain("widgets_delete_widget")
  })

  it("adds outputSchema to one tool when asked for that tool only", () => {
    const withOutput = buildTools(widgetOperations(), {
      tools: { widgets_get_widget_by_id: { outputSchema: true } },
    })
      .filter((tool) => tool.outputSchema)
      .map((tool) => tool.name)

    expect(withOutput).toEqual(["widgets_get_widget_by_id"])
  })

  it("lets one tool turn outputSchema off when it is on for all", () => {
    const tools = buildTools(widgetOperations(), {
      outputSchema: true,
      tools: { widgets_list_widgets: { outputSchema: false } },
    })

    expect(tools[0]).not.toHaveProperty("outputSchema")
    expect(tools[1]).toHaveProperty("outputSchema")
  })

  it("rejects options for a tool that does not exist", () => {
    expect(() =>
      buildTools(widgetOperations(), {
        tools: { widgets_list_gadgets: { outputSchema: true } },
      }),
    ).toThrow(/widgets_list_gadgets/)
  })

  it("rejects two operations that give the same tool name", () => {
    const [list] = widgetOperations()
    expect(() => buildTools([list!, list!])).toThrow(/widgets_list_widgets/)
  })

  it("builds tools the MCP SDK accepts unchanged, with schemas that compile as JSON Schema 2020-12", () => {
    for (const tool of buildTools(widgetOperations(), { outputSchema: true })) {
      const typed: Tool = tool
      expect(ToolSchema.parse(typed)).toEqual(tool)
      expect(() => compile2020(tool.inputSchema)).not.toThrow()
      if (tool.outputSchema) {
        expect(() => compile2020(tool.outputSchema!)).not.toThrow()
      }
    }
  })

  it("builds an input schema that accepts what zod accepts and rejects an unknown query key", () => {
    const validate = compile2020(
      buildTool(widgetOperation("widgets.listWidgets")).inputSchema,
    )

    expect(validate({ query: { "page[limit]": 10 } })).toBe(true)
    expect(validate({ query: { "page[limit]": 0 } })).toBe(false)
    expect(validate({ query: { page: 1 } })).toBe(false)
    expect(validate({ pages: {} })).toBe(false)
  })
})
