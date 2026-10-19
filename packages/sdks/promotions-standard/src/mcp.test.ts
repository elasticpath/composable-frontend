import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { ToolSchema } from "@modelcontextprotocol/sdk/types.js"
import type { Tool as ListedTool } from "@modelcontextprotocol/sdk/types.js"
import fs from "node:fs"
import * as main from "./index"
import { client as defaultClient } from "./client/client.gen"
import * as mcp from "./mcp"
import { createAPromotionTool, getAllPromotionsTool, tools } from "./mcp"
import type { Tool } from "./mcp"

const baseUrl = "https://useast.api.elasticpath.com"
const OPERATION = "com.elasticpath/operation"

function stubFetch(body: unknown, status = 200) {
  const requests: Request[] = []
  const fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push(
      input instanceof Request && init === undefined
        ? input
        : new Request(input, init),
    )
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  }) as typeof globalThis.fetch
  return { requests, fetch }
}

const clientWith = (
  fetch: typeof globalThis.fetch,
  config?: { headers: Record<string, string> },
) =>
  main.createPromotionsStandardClient({
    baseUrl,
    token: "pre-issued",
    fetch,
    retry: false,
    config,
  })

const extraWith = (signal = new AbortController().signal) =>
  ({ signal }) as Parameters<Tool["handler"]>[1]

async function connect(registered: Tool[]) {
  const server = new McpServer({
    name: "promotions-standard",
    version: "1.0.0",
  })
  registered.forEach((t) => server.registerTool(t.name, t.config, t.handler))
  const mcpClient = new Client({ name: "test-client", version: "1.0.0" })
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair()
  await Promise.all([server.connect(serverSide), mcpClient.connect(clientSide)])
  return mcpClient
}

const functionNamesInOperationOrder = () =>
  [
    ...fs
      .readFileSync(new URL("./client/sdk.gen.ts", import.meta.url), "utf8")
      .matchAll(/^export const (\w+) =/gm),
  ].map((match) => match[1]!)

const operationOf = (tool: Tool) => tool.config._meta[OPERATION]

const docCommentOf = (functionName: string) => {
  const source = fs.readFileSync(
    new URL("./client/sdk.gen.ts", import.meta.url),
    "utf8",
  )
  const comment = source
    .split(`\nexport const ${functionName} =`)[0]!
    .split("/**")
    .at(-1)!
    .split("*/")[0]!
  return comment
    .split("\n")
    .map((line) => line.replace(/^\s*\* ?/, "").trim())
    .join("\n")
    .trim()
}

const overrides = new URL(
  "../../specs/overrides/mcp/promotions-standard/",
  import.meta.url,
)

const writtenDescriptions = () =>
  fs.readdirSync(overrides).map((file) =>
    fs
      .readFileSync(new URL(file, overrides), "utf8")
      .split("x-mcp-description: >-")[1]!
      .split(/\n(?=\S)/)[0]!
      .trim()
      .split(/\s*\n\s*/)
      .join(" "),
  )

describe("tools", () => {
  it("holds 14 tools with valid, unique names, in operation order", () => {
    const names = tools().map((tool) => tool.name)

    expect(names).toHaveLength(14)
    for (const name of names) expect(name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/)
    expect(new Set(names).size).toBe(14)
    expect(tools().map((tool) => operationOf(tool).id)).toEqual(
      functionNamesInOperationOrder().map(
        (name) => `promotions_standard.${name}`,
      ),
    )
  })

  it("exports one tool factory for each operation", () => {
    const factories = Object.keys(mcp).filter((name) => name.endsWith("Tool"))

    expect(factories).toHaveLength(14)
  })

  describe("sends each tool's request to its own operation's method and path", () => {
    const { requests, fetch } = stubFetch({})
    const client = clientWith(fetch)

    it.each(tools({ client }).map((tool) => [tool.name, tool] as const))(
      "%s",
      async (_name, tool) => {
        requests.length = 0
        const { method, path } = operationOf(tool)
        const params = [...path.matchAll(/\{([^}]+)\}/g)].map(
          (match) => match[1]!,
        )
        const args: Record<string, unknown> = {}
        if (params.length > 0) {
          args.path = Object.fromEntries(params.map((p) => [p, `p-${p}`]))
        }
        if ("body" in tool.config.inputSchema.shape) args.body = {}

        await tool.handler(args, extraWith())

        expect(requests).toHaveLength(1)
        expect(requests[0]!.method).toBe(method)
        expect(new URL(requests[0]!.url).pathname).toBe(
          path.replace(/\{([^}]+)\}/g, (_match, p) => `p-${p}`),
        )
      },
    )
  })
})

describe("the client a tool calls through", () => {
  const response = { data: [] }
  let original: ReturnType<typeof defaultClient.getConfig>
  let viaDefault: ReturnType<typeof stubFetch>

  beforeEach(() => {
    original = defaultClient.getConfig()
    viaDefault = stubFetch(response)
    defaultClient.setConfig({ fetch: viaDefault.fetch })
  })

  afterEach(() => {
    defaultClient.setConfig({
      ...original,
      auth: original.auth,
      fetch: original.fetch,
    })
  })

  it("calls through the package's default client when no client is given", async () => {
    const result = await getAllPromotionsTool().handler({}, extraWith())

    expect(viaDefault.requests).toHaveLength(1)
    expect(viaDefault.requests[0]!.url).toBe(
      `${original.baseUrl}/v2/promotions`,
    )
    expect(result.structuredContent).toEqual(response)
  })

  it("sends the credentials of a default client configured from a promotions standard client", async () => {
    defaultClient.setConfig(clientWith(viaDefault.fetch).getConfig())

    await getAllPromotionsTool().handler({}, extraWith())

    expect(viaDefault.requests[0]!.headers.get("Authorization")).toBe(
      "Bearer pre-issued",
    )
  })

  it("uses a given client instead of the default", async () => {
    const viaGiven = stubFetch(response)

    await getAllPromotionsTool({ client: clientWith(viaGiven.fetch) }).handler(
      {},
      extraWith(),
    )

    expect(viaDefault.requests).toHaveLength(0)
    expect(viaGiven.requests).toHaveLength(1)
    const url = new URL(viaGiven.requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/promotions`)
  })

  it("sends headers configured on the client with every tool call", async () => {
    const { requests, fetch } = stubFetch(response)
    const client = clientWith(fetch, {
      headers: { "EP-Store-Id": "store-1", "EP-Org-Id": "org-1" },
    })

    await getAllPromotionsTool({ client }).handler({}, extraWith())

    expect(requests[0]!.headers.get("EP-Store-Id")).toBe("store-1")
    expect(requests[0]!.headers.get("EP-Org-Id")).toBe("org-1")
  })
})

describe("a tool's handler", () => {
  it("aborts the request when the MCP request is cancelled", async () => {
    const { requests, fetch } = stubFetch({})
    const controller = new AbortController()

    await getAllPromotionsTool({ client: clientWith(fetch) }).handler(
      {},
      extraWith(controller.signal),
    )
    expect(requests[0]!.signal.aborted).toBe(false)
    controller.abort()

    expect(requests[0]!.signal.aborted).toBe(true)
  })

  it("returns an API error as an isError result with the HTTP status", async () => {
    const errors = { errors: [{ status: 404, title: "Not Found" }] }
    const { fetch } = stubFetch(errors, 404)

    const result = await getAllPromotionsTool({
      client: clientWith(fetch),
    }).handler({}, extraWith())

    expect(result).toEqual({
      isError: true,
      content: [{ type: "text", text: `HTTP 404: ${JSON.stringify(errors)}` }],
    })
  })

  it("returns a network failure as an isError result with its message", async () => {
    const fetch = (async () => {
      throw new TypeError("fetch failed")
    }) as typeof globalThis.fetch

    const result = await getAllPromotionsTool({
      client: clientWith(fetch),
    }).handler({}, extraWith())

    expect(result.isError).toBe(true)
    expect(result.content).toEqual([
      { type: "text", text: expect.stringContaining("fetch failed") },
    ])
  })
})

describe("a tool's description", () => {
  it("is the description written for it in the spec overrides, for every tool", () => {
    expect(
      tools()
        .map((tool) => tool.config.description)
        .sort(),
    ).toEqual(writtenDescriptions().sort())
  })

  it("leaves the full spec text to the SDK function's doc comment", () => {
    expect(docCommentOf("createAPromotion").length).toBeGreaterThan(600)
  })
})

describe("the promotions standard tools on an MCP server", () => {
  let listed: ListedTool[]

  beforeAll(async () => {
    const mcpClient = await connect(
      tools({ client: clientWith(stubFetch({}).fetch) }),
    )
    listed = (await mcpClient.listTools()).tools
  })

  it("describes every tool in at most 600 characters", () => {
    for (const tool of listed) {
      expect(tool.description!.length, tool.name).toBeLessThanOrEqual(600)
    }
  })

  it("lists all 14, each passing the MCP SDK's ToolSchema", () => {
    expect(listed).toHaveLength(14)
    for (const tool of listed) {
      expect(ToolSchema.safeParse(tool).success, tool.name).toBe(true)
    }
  })

  it("asks no tool for an Authorization header", () => {
    for (const tool of listed) {
      const headers = (tool.inputSchema.properties as Record<string, any>)
        ?.headers
      const names = Object.keys(headers?.properties ?? {})

      expect(names.map((name) => name.toLowerCase())).not.toContain(
        "authorization",
      )
    }
  })

  it("rejects an unknown query key without sending the request", async () => {
    const { requests, fetch } = stubFetch({})
    const mcpClient = await connect([
      getAllPromotionsTool({ client: clientWith(fetch) }),
    ])

    const result = await mcpClient.callTool({
      name: "promotions_standard_get_all_promotions",
      arguments: { query: { colour: "red" } },
    })

    expect(result.isError).toBe(true)
    expect(requests).toHaveLength(0)
  })

  it("keeps a body attribute the spec does not list when the tool is called through an MCP server", async () => {
    const { requests, fetch } = stubFetch({})
    const mcpClient = await connect([
      createAPromotionTool({ client: clientWith(fetch) }),
    ])
    const args = {
      body: {
        data: {
          type: "promotion",
          id: "00000000-0000-4000-8000-000000000000",
          name: "Buy SKU1 and SKU2 to get free gift",
          description: "SKU1 and SKU2 for free gift",
          automatic: false,
          enabled: false,
          promotion_type: "fixed_discount",
          start: "2020-01-01",
          end: "2100-01-01",
          unlisted_attribute: { nested: true },
        },
        unlisted_attribute: { nested: true },
      },
    }

    const result = await mcpClient.callTool({
      name: "promotions_standard_create_a_promotion",
      arguments: args,
    })

    expect(result.isError, JSON.stringify(result.content)).toBeFalsy()
    expect(await requests[0]!.json()).toMatchObject(args.body)
  })

  it("asks for promotion codes wrapped in data, as the service reads them", async () => {
    const { requests, fetch } = stubFetch({ data: {} }, 201)
    const mcpClient = await connect(tools({ client: clientWith(fetch) }))
    const body = {
      data: { type: "promotion_codes", codes: [{ code: "SUMMER" }] },
    }

    const result = await mcpClient.callTool({
      name: "promotions_standard_create_promotion_codes",
      arguments: { path: { promotionID: "p-1" }, body },
    })

    expect(result.isError).toBeFalsy()
    expect(await requests[0]!.json()).toEqual(body)
    const tool = listed.find(
      ({ name }) => name === "promotions_standard_create_promotion_codes",
    )!
    const input = (tool.inputSchema.properties as Record<string, any>).body
    expect(input.required).toEqual(["data"])
  })

  it("sends a call through the given client and returns the data", async () => {
    const response = { data: [] }
    const { requests, fetch } = stubFetch(response)
    const mcpClient = await connect(tools({ client: clientWith(fetch) }))

    const result = await mcpClient.callTool({
      name: "promotions_standard_get_all_promotions",
      arguments: {},
    })

    expect(requests).toHaveLength(1)
    const url = new URL(requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/promotions`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(result.structuredContent).toEqual(response)
  })
})

describe("the main entry", () => {
  it("exports no MCP code", () => {
    expect(main).not.toHaveProperty("tools")
    expect(main).not.toHaveProperty("getAllPromotionsTool")
  })
})
