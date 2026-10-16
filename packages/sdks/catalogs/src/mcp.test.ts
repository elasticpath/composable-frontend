import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { ToolSchema } from "@modelcontextprotocol/sdk/types.js"
import type { Tool } from "@modelcontextprotocol/sdk/types.js"
import fs from "node:fs"
import * as main from "./index"
import { client as defaultClient } from "./client/client.gen"
import * as mcp from "./mcp"
import {
  getCatalogsTool,
  registerTools,
  tools,
  validateCatalogRulesTool,
} from "./mcp"

const baseUrl = "https://useast.api.elasticpath.com"
const OPERATION = "com.elasticpath/operation"

function stubFetch(body: unknown) {
  const requests: Request[] = []
  const fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push(
      input instanceof Request && init === undefined
        ? input
        : new Request(input, init),
    )
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }) as typeof globalThis.fetch
  return { requests, fetch }
}

const clientWith = (fetch: typeof globalThis.fetch) =>
  main.createCatalogsClient({
    baseUrl,
    token: "pre-issued",
    fetch,
    retry: false,
  })

const operationOf = (tool: { config: { _meta: Record<string, unknown> } }) =>
  tool.config._meta[OPERATION] as { method: string; path: string }

async function connect(client?: ReturnType<typeof clientWith>) {
  const server = new McpServer({ name: "catalogs", version: "1.0.0" })
  registerTools(server, tools, client ? { client } : undefined)
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

const functionNameOf = (tool: { config: { _meta: Record<string, unknown> } }) =>
  (tool.config._meta[OPERATION] as { id: string }).id.split(".")[1]!

describe("tools", () => {
  it("holds 30 tools with valid, unique names", () => {
    const names = tools.map((tool) => tool.name)

    expect(names).toHaveLength(30)
    for (const name of names) expect(name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/)
    expect(new Set(names).size).toBe(30)
    expect(names).toContain("catalogs_get_catalog_by_id")
  })

  it("marks validateCatalogRules read-only, from the x-mcp-risk override in the spec", () => {
    expect(operationOf(validateCatalogRulesTool).method).toBe("POST")
    expect(validateCatalogRulesTool.config.annotations).toMatchObject({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    })
  })

  describe("sends each tool's request to its own operation's method and path", () => {
    const { requests, fetch } = stubFetch({})
    const client = clientWith(fetch)

    it.each(tools.map((tool) => [tool.name, tool] as const))(
      "%s",
      async (_name, tool) => {
        requests.length = 0
        const { method, path } = operationOf(tool)
        const params = [...path.matchAll(/\{([^}]+)\}/g)].map(
          (match) => match[1]!,
        )
        const options: Record<string, unknown> = { client }
        if (params.length > 0) {
          options.path = Object.fromEntries(params.map((p) => [p, `p-${p}`]))
        }
        if ("body" in tool.config.inputSchema.shape) options.body = {}

        await tool.call(options)

        expect(requests).toHaveLength(1)
        expect(requests[0]!.method).toBe(method)
        expect(new URL(requests[0]!.url).pathname).toBe(
          path.replace(/\{([^}]+)\}/g, (_match, p) => `p-${p}`),
        )
      },
    )
  })
})

describe("the named exports", () => {
  it("export each tool by name, and tools holds all 30 in operation order", () => {
    const named = Object.entries(mcp).filter(([name]) => name.endsWith("Tool"))

    expect(named).toHaveLength(30)
    expect(tools.map(functionNameOf)).toEqual(functionNamesInOperationOrder())
    for (const tool of tools) {
      expect(mcp[`${functionNameOf(tool)}Tool` as keyof typeof mcp]).toBe(tool)
    }
  })
})

describe("the client a tool calls through", () => {
  const catalogs = { data: [], links: {}, meta: { results: { total: 0 } } }
  let original: ReturnType<typeof defaultClient.getConfig>
  let viaDefault: ReturnType<typeof stubFetch>

  beforeEach(() => {
    original = defaultClient.getConfig()
    viaDefault = stubFetch(catalogs)
    defaultClient.setConfig({ fetch: viaDefault.fetch })
  })

  afterEach(() => {
    defaultClient.setConfig({ ...original, fetch: original.fetch })
  })

  describe("calls through the package's default client when no client is given", () => {
    it("from call", async () => {
      const result = await getCatalogsTool.call()

      expect(viaDefault.requests).toHaveLength(1)
      expect(viaDefault.requests[0]!.url).toBe(`${original.baseUrl}/catalogs`)
      expect(result.structuredContent).toEqual(catalogs)
    })

    it("from a tool registered with no client", async () => {
      const mcpClient = await connect()

      const result = await mcpClient.callTool({
        name: "catalogs_get_catalogs",
        arguments: {},
      })

      expect(viaDefault.requests).toHaveLength(1)
      expect(viaDefault.requests[0]!.url).toBe(`${original.baseUrl}/catalogs`)
      expect(result.structuredContent).toEqual(catalogs)
    })
  })

  describe("uses a given client instead of the default", () => {
    it("from call", async () => {
      const viaGiven = stubFetch(catalogs)

      await getCatalogsTool.call({
        client: clientWith(viaGiven.fetch),
        query: { "page[limit]": 10 },
      })

      expect(viaDefault.requests).toHaveLength(0)
      expect(viaGiven.requests).toHaveLength(1)
      const url = new URL(viaGiven.requests[0]!.url)
      expect(url.origin + url.pathname).toBe(`${baseUrl}/catalogs`)
      expect(url.searchParams.get("page[limit]")).toBe("10")
    })

    it("from registerTools", async () => {
      const viaGiven = stubFetch(catalogs)
      const mcpClient = await connect(clientWith(viaGiven.fetch))

      await mcpClient.callTool({ name: "catalogs_get_catalogs", arguments: {} })

      expect(viaDefault.requests).toHaveLength(0)
      expect(viaGiven.requests).toHaveLength(1)
    })
  })
})

describe("the catalogs tools on an MCP server", () => {
  let listed: Tool[]

  beforeAll(async () => {
    listed = (
      await (await connect(clientWith(stubFetch({}).fetch))).listTools()
    ).tools
  })

  it("lists all 30, each passing the MCP SDK's ToolSchema", () => {
    expect(listed).toHaveLength(30)
    for (const tool of listed) {
      expect(ToolSchema.safeParse(tool).success, tool.name).toBe(true)
    }
  })

  it("writes the 64-bit paging fields as integers", () => {
    const tool = listed.find(({ name }) => name === "catalogs_get_catalogs")!
    const query = (tool.inputSchema.properties as Record<string, any>).query

    expect(query.properties["page[offset]"]).toMatchObject({
      type: "integer",
    })
    expect(query.properties["page[limit]"]).toMatchObject({ type: "integer" })
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

  it("sends a call through the configured client and returns the data", async () => {
    const catalogs = { data: [], links: {}, meta: { results: { total: 0 } } }
    const { requests, fetch } = stubFetch(catalogs)
    const mcpClient = await connect(clientWith(fetch))

    const result = await mcpClient.callTool({
      name: "catalogs_get_catalogs",
      arguments: { query: { "page[limit]": 10 } },
    })

    expect(requests).toHaveLength(1)
    const url = new URL(requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/catalogs`)
    expect(url.searchParams.get("page[limit]")).toBe("10")
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(result.structuredContent).toEqual(catalogs)
  })
})

describe("the main entry", () => {
  it("exports no MCP code", () => {
    expect(main).not.toHaveProperty("tools")
    expect(main).not.toHaveProperty("getCatalogsTool")
    expect(main).not.toHaveProperty("registerTools")
  })
})
