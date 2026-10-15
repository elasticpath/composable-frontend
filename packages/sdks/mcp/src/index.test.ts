import { describe, expect, it, vi } from "vitest"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { z } from "zod"
import { callSdk, registerTools } from "./index"
import type { EndpointTool } from "./index"

type SdkOptions = { path?: { widget_id: string }; client: unknown }

function widgetTool(
  fn: (options: SdkOptions) => Promise<unknown>,
): EndpointTool {
  return {
    name: "widgets_get_widget",
    config: {
      title: "Get a widget",
      description: "Reads one widget.",
      inputSchema: z
        .object({
          path: z
            .object({
              widget_id: z.string().register(z.globalRegistry, {
                description: "The widget ID.",
              }),
            })
            .strict(),
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      _meta: { "com.elasticpath/operation": { id: "widgets.getWidget" } },
    },
    handler: (args) => callSdk(fn as never, "the client", args),
  }
}

const ok = (data: unknown) => ({
  data,
  error: undefined,
  response: new Response(null, { status: 200 }),
})

async function connected(tools: EndpointTool[]) {
  const server = new McpServer({ name: "test", version: "1.0.0" })
  const registered = registerTools(server, tools)
  const client = new Client({ name: "test-client", version: "1.0.0" })
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair()
  await Promise.all([server.connect(serverSide), client.connect(clientSide)])
  return { client, registered }
}

describe("registerTools", () => {
  it("makes each tool listable with its name, annotations and _meta", async () => {
    const tool = widgetTool(async () => ok({}))
    const { client, registered } = await connected([tool])

    const { tools } = await client.listTools()

    expect(registered).toHaveLength(1)
    expect(tools).toHaveLength(1)
    expect(tools[0]).toMatchObject({
      name: "widgets_get_widget",
      title: "Get a widget",
      description: "Reads one widget.",
      annotations: tool.config.annotations,
      _meta: tool.config._meta,
    })
    expect(
      (tools[0]!.inputSchema.properties as any).path.properties.widget_id,
    ).toMatchObject({ type: "string", description: "The widget ID." })
  })

  it("runs the handler on a call and returns structured content with a text copy", async () => {
    const widget = { id: "w1", name: "Widget" }
    const fn = vi.fn(async () => ok(widget))
    const { client } = await connected([widgetTool(fn)])

    const result = await client.callTool({
      name: "widgets_get_widget",
      arguments: { path: { widget_id: "w1" } },
    })

    expect(fn).toHaveBeenCalledWith({
      path: { widget_id: "w1" },
      client: "the client",
      throwOnError: false,
    })
    expect(result).toEqual({
      structuredContent: widget,
      content: [{ type: "text", text: JSON.stringify(widget) }],
    })
  })

  it("rejects an unknown key in a strict section without calling the handler", async () => {
    const fn = vi.fn(async () => ok({}))
    const { client } = await connected([widgetTool(fn)])

    const result = await client.callTool({
      name: "widgets_get_widget",
      arguments: { path: { widget_id: "w1", colour: "red" } },
    })

    expect(result.isError).toBe(true)
    expect(fn).not.toHaveBeenCalled()
  })
})

describe("callSdk", () => {
  it("wraps data that is not an object as { data }", async () => {
    const result = await callSdk(async () => ok([1, 2]), undefined, {})

    expect(result).toEqual({
      structuredContent: { data: [1, 2] },
      content: [{ type: "text", text: JSON.stringify({ data: [1, 2] }) }],
    })
  })

  it("returns an API error as isError with the status, without throwing", async () => {
    const body = { errors: [{ status: "404", title: "Not Found" }] }
    const fn = async () => ({
      data: undefined,
      error: body,
      response: new Response(null, { status: 404 }),
    })

    const result = await callSdk(fn, undefined, {})

    expect(result).toEqual({
      isError: true,
      content: [{ type: "text", text: `HTTP 404: ${JSON.stringify(body)}` }],
    })
  })

  it("returns a network failure as isError with its message, without throwing", async () => {
    const fn = async (): Promise<never> => {
      throw new TypeError("fetch failed")
    }

    const result = await callSdk(fn, undefined, {})

    expect(result).toEqual({
      isError: true,
      content: [{ type: "text", text: "Network error: fetch failed" }],
    })
  })
})
