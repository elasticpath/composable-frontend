import { describe, expect, it, vi } from "vitest"
import { ToolCallError, createEndpointTools } from "./index"
import { widgetOperations } from "./test/widgets"
import type { OperationBindings, ToolValidatorContext } from "./types"

const widget = {
  id: "w-1",
  name: "Sprocket",
  price: { amount: 1250, currency: "USD" },
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function sdkFunctionAnsweringWith(response: Response | Error) {
  return vi.fn<OperationBindings["fn"]>(async () => {
    if (response instanceof Error) return { error: response }
    const body = response.status === 204 ? undefined : await response.json()
    return response.ok
      ? { data: body ?? {}, response }
      : { error: body, response }
  })
}

const client = { id: "the configured client" }

describe("createEndpointTools", () => {
  it("lists the tool names and builds a tool only when it is first asked for", () => {
    const tools = createEndpointTools(widgetOperations(), { client })

    expect(tools.names).toContain("widgets_get_widget_by_id")
    expect(tools.tool("widgets_get_widget_by_id")).toBe(
      tools.tool("widgets_get_widget_by_id"),
    )
    expect(tools.list()).toHaveLength(5)
  })

  it("calls the SDK function with the client and the caller's original arguments", async () => {
    const fn = sdkFunctionAnsweringWith(json({ data: [widget] }))
    const tools = createEndpointTools(widgetOperations(fn), { client })
    const args = { query: { "page[limit]": "10", filter: "eq(name,Sprocket)" } }

    await tools.call("widgets_list_widgets", args)

    expect(fn).toHaveBeenCalledWith({
      client,
      query: { "page[limit]": "10", filter: "eq(name,Sprocket)" },
      throwOnError: false,
    })
  })

  it("uses a client given for one call in place of the configured one", async () => {
    const fn = sdkFunctionAnsweringWith(json({ data: widget }))
    const tools = createEndpointTools(widgetOperations(fn), { client })
    const perCall = { id: "this caller's client" }

    await tools.call(
      "widgets_get_widget_by_id",
      { path: { widget_id: "w-1" } },
      { client: perCall },
    )

    expect(fn.mock.calls[0]![0]).toMatchObject({ client: perCall })
  })

  it("returns the data as structured content with a text copy", async () => {
    const tools = createEndpointTools(
      widgetOperations(sdkFunctionAnsweringWith(json({ data: widget }))),
      { client },
    )

    const result = await tools.call("widgets_get_widget_by_id", {
      path: { widget_id: "w-1" },
    })

    expect(result).toEqual({
      structuredContent: { data: widget },
      content: [{ type: "text", text: JSON.stringify({ data: widget }) }],
    })
  })

  it("returns null data for a 204", async () => {
    const tools = createEndpointTools(
      widgetOperations(
        sdkFunctionAnsweringWith(new Response(null, { status: 204 })),
      ),
      { client },
    )

    const result = await tools.call("widgets_delete_widget", {
      path: { widget_id: "w-1" },
    })

    expect(result.structuredContent).toEqual({ data: null })
    expect(result.isError).toBeUndefined()
  })

  describe("validation", () => {
    const tools = (fn = sdkFunctionAnsweringWith(json({ data: widget }))) => ({
      fn,
      tools: createEndpointTools(widgetOperations(fn), { client }),
    })

    it.each([
      [
        "path",
        "widgets_get_widget_by_id",
        { path: { widget_id: "w-1", extra: 1 } },
      ],
      ["query", "widgets_list_widgets", { query: { page: 2 } }],
      [
        "headers",
        "widgets_list_widgets",
        { headers: { "x-moltin-currency": "USD" } },
      ],
    ])(
      "rejects an unknown %s key without calling the API",
      async (section, name, args) => {
        const { fn, tools: endpointTools } = tools()

        const result = await endpointTools.call(name, args)

        expect(result.isError).toBe(true)
        expect(result.content).toEqual([
          {
            type: "text",
            text: expect.stringMatching(
              new RegExp(`^Invalid input at /${section}`),
            ),
          },
        ])
        expect(fn).not.toHaveBeenCalled()
      },
    )

    it("rejects the Authorization header, which the client supplies", async () => {
      const { fn, tools: endpointTools } = tools()

      const result = await endpointTools.call("widgets_list_widgets", {
        headers: { Authorization: "Bearer stolen" },
      })

      expect(result.isError).toBe(true)
      expect(fn).not.toHaveBeenCalled()
    })

    it("accepts a header in any capitalisation and sends it under the schema's spelling", async () => {
      const { fn, tools: endpointTools } = tools()

      const result = await endpointTools.call("widgets_list_widgets", {
        headers: { "Accept-Language": "fr" },
      })

      expect(result.isError).toBeUndefined()
      expect(fn).toHaveBeenCalledWith(
        expect.objectContaining({ headers: { "accept-language": "fr" } }),
      )
    })

    it("rejects the same header given twice in different capitalisations", async () => {
      const { fn, tools: endpointTools } = tools()

      const result = await endpointTools.call("widgets_list_widgets", {
        headers: { "Accept-Language": "fr", "accept-language": "de" },
      })

      expect(result.content).toEqual([
        {
          type: "text",
          text: expect.stringMatching(
            /^Invalid input at \/headers\/accept-language/,
          ),
        },
      ])
      expect(fn).not.toHaveBeenCalled()
    })

    it("rejects an unknown top-level key", async () => {
      const { tools: endpointTools } = tools()

      const result = await endpointTools.call("widgets_list_widgets", {
        page: { limit: 2 },
      })

      expect(result.content[0]).toMatchObject({
        text: expect.stringMatching(/^Invalid input at \/page/),
      })
    })

    it("rejects a value the zod schema rejects, naming where it is", async () => {
      const { tools: endpointTools } = tools()

      const result = await endpointTools.call("widgets_list_widgets", {
        query: { "page[limit]": 0 },
      })

      expect(result.content[0]).toMatchObject({
        text: expect.stringMatching(
          /^Invalid input at \/query\/page\[limit\]: /,
        ),
      })
    })

    it("rejects a missing required section", async () => {
      const { tools: endpointTools } = tools()

      const result = await endpointTools.call("widgets_create_widget", {})

      expect(result.content[0]).toMatchObject({
        text: expect.stringMatching(/^Invalid input at \/body/),
      })
    })

    it("keeps unknown body keys, because the body follows the spec", async () => {
      const { fn, tools: endpointTools } = tools()
      const body = {
        name: "Sprocket",
        price: { amount: 1250, currency: "USD" },
        colour: "blue",
      }

      const result = await endpointTools.call("widgets_create_widget", { body })

      expect(result.isError).toBeUndefined()
      expect(fn.mock.calls[0]![0]).toMatchObject({ body })
    })

    it("accepts no arguments at all for a tool with no required section", async () => {
      const { fn, tools: endpointTools } = tools()

      await endpointTools.call("widgets_list_widgets", undefined)

      expect(fn).toHaveBeenCalledWith({ client, throwOnError: false })
    })
  })

  describe("the per-tool validate override", () => {
    it("replaces the default validation for that tool only", async () => {
      const fn = sdkFunctionAnsweringWith(json({ data: widget }))
      const tools = createEndpointTools(widgetOperations(fn), {
        client,
        tools: { widgets_create_widget: { validate: () => {} } },
      })

      const accepted = await tools.call("widgets_create_widget", {
        body: { name: null },
      })
      const rejected = await tools.call("widgets_update_widget", {
        path: { widget_id: "w-1" },
        body: { name: null },
      })

      expect(accepted.isError).toBeUndefined()
      expect(rejected.isError).toBe(true)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("can call the default validation it replaces", async () => {
      const validate = vi.fn(
        (args: unknown, { validate: defaults }: ToolValidatorContext) => {
          const { body } = args as { body: { name: unknown } }
          defaults({
            ...(args as object),
            body: { ...body, name: body.name ?? "" },
          })
        },
      )
      const fn = sdkFunctionAnsweringWith(json({ data: widget }))
      const tools = createEndpointTools(widgetOperations(fn), {
        client,
        tools: { widgets_create_widget: { validate } },
      })

      const nullName = await tools.call("widgets_create_widget", {
        body: { name: null, price: { amount: 1, currency: "USD" } },
      })
      const noPrice = await tools.call("widgets_create_widget", {
        body: { name: null },
      })

      expect(nullName.isError).toBeUndefined()
      expect(noPrice.content[0]).toMatchObject({
        text: expect.stringMatching(/^Invalid input at \/body\/price/),
      })
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("reports any other error it throws as invalid input", async () => {
      const tools = createEndpointTools(widgetOperations(), {
        client,
        tools: {
          widgets_list_widgets: {
            validate: () => {
              throw new Error("Ask for fewer widgets.")
            },
          },
        },
      })

      const result = await tools.call("widgets_list_widgets", {})

      expect(result.content).toEqual([
        { type: "text", text: "Invalid input: Ask for fewer widgets." },
      ])
    })
  })

  describe("errors", () => {
    it("reports an API error with its status and body", async () => {
      const body = { errors: [{ status: 404, title: "Not Found" }] }
      const tools = createEndpointTools(
        widgetOperations(sdkFunctionAnsweringWith(json(body, 404))),
        { client },
      )

      const result = await tools.call("widgets_get_widget_by_id", {
        path: { widget_id: "missing" },
      })

      expect(result).toEqual({
        isError: true,
        content: [{ type: "text", text: `HTTP 404: ${JSON.stringify(body)}` }],
      })
    })

    it("reports a request that got no response as a network error", async () => {
      const tools = createEndpointTools(
        widgetOperations(
          sdkFunctionAnsweringWith(new TypeError("fetch failed")),
        ),
        { client },
      )

      const result = await tools.call("widgets_list_widgets", {})

      expect(result.content).toEqual([
        { type: "text", text: "Network error: fetch failed" },
      ])
    })

    it("hands mapError one ToolCallError, whatever went wrong", async () => {
      const mapError = vi.fn(({ error }: { error: ToolCallError }) => ({
        isError: true,
        content: [{ type: "text" as const, text: error.reason }],
      }))
      const body = { errors: [{ status: 409 }] }
      const tools = createEndpointTools(
        widgetOperations(sdkFunctionAnsweringWith(json(body, 409))),
        { client, hooks: { mapError } },
      )

      const invalid = await tools.call("widgets_list_widgets", {
        query: { page: 1 },
      })
      const conflict = await tools.call("widgets_list_widgets", {})

      expect(invalid.content).toEqual([{ type: "text", text: "invalid_input" }])
      expect(conflict.content).toEqual([{ type: "text", text: "http" }])
      const [first, second] = mapError.mock.calls.map(([call]) => call.error)
      expect(first).toBeInstanceOf(ToolCallError)
      expect(first).toMatchObject({
        reason: "invalid_input",
        pointer: "/query/page",
      })
      expect(second).toBeInstanceOf(ToolCallError)
      expect(second).toMatchObject({ reason: "http", status: 409, body })
      expect(mapError.mock.calls[1]![0]).toMatchObject({
        name: "widgets_list_widgets",
        args: {},
      })
    })

    it("throws a ToolCallError for a tool name it does not have", async () => {
      const tools = createEndpointTools(widgetOperations(), { client })
      const unknownTool = expect.objectContaining({
        name: "ToolCallError",
        reason: "unknown_tool",
        message: expect.stringContaining("widgets_list_gadgets"),
      })

      await expect(tools.call("widgets_list_gadgets", {})).rejects.toEqual(
        unknownTool,
      )
      expect(() => tools.tool("widgets_list_gadgets")).toThrow(ToolCallError)
    })
  })

  describe("formatResult", () => {
    it("formats the data its own way, given the tool, arguments and response", async () => {
      const formatResult = vi.fn(
        ({ data, response }: { data: unknown; response: Response }) => ({
          content: [
            {
              type: "text" as const,
              text: `${response.status} ${
                (data as { data: unknown[] }).data.length
              } widget(s)`,
            },
          ],
        }),
      )
      const tools = createEndpointTools(
        widgetOperations(sdkFunctionAnsweringWith(json({ data: [widget] }))),
        { client, hooks: { formatResult } },
      )

      const result = await tools.call("widgets_list_widgets", {})

      expect(result).toEqual({
        content: [{ type: "text", text: "200 1 widget(s)" }],
      })
      expect(formatResult.mock.calls[0]![0]).toMatchObject({
        name: "widgets_list_widgets",
        args: {},
        operation: { facts: { id: "widgets.listWidgets" } },
      })
    })
  })
})
