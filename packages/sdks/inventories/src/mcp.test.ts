import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { Client } from "@modelcontextprotocol/client"
import {
  InMemoryTransport,
  isSpecType,
  McpServer,
} from "@modelcontextprotocol/server"
import type { Tool as ListedTool } from "@modelcontextprotocol/server"
import fs from "node:fs"
import * as main from "./index"
import { client as defaultClient } from "./client/client.gen"
import * as mcp from "./mcp"
import { createStockTool, listStockTool, createImportTool, tools } from "./mcp"
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
  main.createInventoriesClient({
    baseUrl,
    token: "pre-issued",
    fetch,
    retry: false,
    config,
  })

const ctxWith = (signal = new AbortController().signal) =>
  ({ mcpReq: { signal } }) as Parameters<Tool["handler"]>[1]

async function connect(registered: Tool[]) {
  const server = new McpServer({ name: "inventories", version: "1.0.0" })
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

const overrides = new URL(
  "../../specs/overrides/mcp/inventories/",
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
  it("holds 18 tools with valid, unique names, in operation order", () => {
    const names = tools().map((tool) => tool.name)

    expect(names).toHaveLength(18)
    for (const name of names) expect(name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/)
    expect(new Set(names).size).toBe(18)
    expect(tools().map((tool) => operationOf(tool).id)).toEqual(
      functionNamesInOperationOrder().map((name) => `inventories.${name}`),
    )
  })

  it("exports one tool factory for each operation", () => {
    const factories = Object.keys(mcp).filter((name) => name.endsWith("Tool"))

    expect(factories).toHaveLength(18)
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

        await tool.handler(args, ctxWith())

        expect(requests).toHaveLength(1)
        expect(requests[0]!.method).toBe(method)
        expect(new URL(requests[0]!.url).pathname).toBe(
          `/v2${path.replace(/\{([^}]+)\}/g, (_match, p) => `p-${p}`)}`,
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
    const result = await listStockTool().handler({}, ctxWith())

    expect(viaDefault.requests).toHaveLength(1)
    expect(viaDefault.requests[0]!.url).toBe(`${original.baseUrl}/inventories`)
    expect(result.structuredContent).toEqual(response)
  })

  it("sends the credentials of a default client configured from a inventories client", async () => {
    defaultClient.setConfig(clientWith(viaDefault.fetch).getConfig())

    await listStockTool().handler({}, ctxWith())

    expect(viaDefault.requests[0]!.headers.get("Authorization")).toBe(
      "Bearer pre-issued",
    )
  })

  it("uses a given client instead of the default", async () => {
    const viaGiven = stubFetch(response)

    await listStockTool({ client: clientWith(viaGiven.fetch) }).handler(
      { query: { "page[limit]": 10 } },
      ctxWith(),
    )

    expect(viaDefault.requests).toHaveLength(0)
    expect(viaGiven.requests).toHaveLength(1)
    const url = new URL(viaGiven.requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/inventories`)
    expect(url.searchParams.get("page[limit]")).toBe("10")
  })

  it("sends headers configured on the client with every tool call", async () => {
    const { requests, fetch } = stubFetch(response)
    const client = clientWith(fetch, {
      headers: { "EP-Store-Id": "store-1", "EP-Org-Id": "org-1" },
    })

    await listStockTool({ client }).handler({}, ctxWith())

    expect(requests[0]!.headers.get("EP-Store-Id")).toBe("store-1")
    expect(requests[0]!.headers.get("EP-Org-Id")).toBe("org-1")
  })
})

describe("a tool's handler", () => {
  it("aborts the request when the MCP request is cancelled", async () => {
    const { requests, fetch } = stubFetch({})
    const controller = new AbortController()

    await listStockTool({ client: clientWith(fetch) }).handler(
      {},
      ctxWith(controller.signal),
    )
    expect(requests[0]!.signal.aborted).toBe(false)
    controller.abort()

    expect(requests[0]!.signal.aborted).toBe(true)
  })

  it("returns an API error as an isError result with the HTTP status", async () => {
    const errors = { errors: [{ status: 404, title: "Not Found" }] }
    const { fetch } = stubFetch(errors, 404)

    const result = await listStockTool({
      client: clientWith(fetch),
    }).handler({}, ctxWith())

    expect(result).toEqual({
      isError: true,
      content: [{ type: "text", text: `HTTP 404: ${JSON.stringify(errors)}` }],
    })
  })

  it("returns a network failure as an isError result with its message", async () => {
    const fetch = (async () => {
      throw new TypeError("fetch failed")
    }) as typeof globalThis.fetch

    const result = await listStockTool({
      client: clientWith(fetch),
    }).handler({}, ctxWith())

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
})

describe("the inventories tools on an MCP server", () => {
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

  it("lists all 18, each passing the MCP SDK's Tool spec type", () => {
    expect(listed).toHaveLength(18)
    for (const tool of listed) {
      expect(isSpecType.Tool(tool), tool.name).toBe(true)
    }
  })

  it("writes the paging fields as integers", () => {
    const tool = listed.find(({ name }) => name === "inventories_list_stock")!
    const query = (tool.inputSchema.properties as Record<string, any>).query

    expect(query.properties["page[limit]"]).toMatchObject({ type: "integer" })
  })

  it("marks createImport as a destructive write, from the x-mcp-risk override in the spec", () => {
    const tool = listed.find(
      ({ name }) => name === "inventories_create_import",
    )!

    expect(tool.annotations).toMatchObject({
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    })
  })

  it("marks createTransaction as a destructive write, from the x-mcp-risk override in the spec", () => {
    const tool = listed.find(
      ({ name }) => name === "inventories_create_transaction",
    )!

    expect(tool.annotations).toMatchObject({
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    })
  })

  it("marks getStockForProducts as read-only, from the x-mcp-risk override in the spec", () => {
    const tool = listed.find(
      ({ name }) => name === "inventories_get_stock_for_products",
    )!

    expect(tool.annotations).toMatchObject({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    })
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
      listStockTool({ client: clientWith(fetch) }),
    ])

    const result = await mcpClient.callTool({
      name: "inventories_list_stock",
      arguments: { query: { colour: "red" } },
    })

    expect(result.isError).toBe(true)
    expect(requests).toHaveLength(0)
  })

  it("keeps a body attribute the spec does not list when the tool is called through an MCP server", async () => {
    const { requests, fetch } = stubFetch({})
    const mcpClient = await connect([
      createStockTool({ client: clientWith(fetch) }),
    ])
    const args = {
      body: {
        data: {
          type: "stock",
          attributes: {},
          unlisted_attribute: { nested: true },
        },
        unlisted_attribute: { nested: true },
      },
    }

    const result = await mcpClient.callTool({
      name: "inventories_create_stock",
      arguments: args,
    })

    expect(result.isError).toBeFalsy()
    expect(await requests[0]!.json()).toMatchObject(args.body)
  })

  it("uploads a data: URI as a multipart file part named from import_file_name", async () => {
    const { requests, fetch } = stubFetch({ data: { id: "import-1" } }, 201)
    const mcpClient = await connect([
      createImportTool({ client: clientWith(fetch) }),
    ])
    const content = Buffer.from("sample upload")

    const result = await mcpClient.callTool({
      name: "inventories_create_import",
      arguments: {
        body: {
          import_file: `data:application/jsonl;base64,${content.toString(
            "base64",
          )}`,
          import_file_name: "stock.jsonl",
          external_ref: "stock-import-1",
        },
      },
    })

    expect(result.isError).toBeFalsy()
    expect(requests[0]!.headers.get("Content-Type")).toMatch(
      /^multipart\/form-data; boundary=/,
    )
    const form = await requests[0]!.formData()
    const file = form.get("import_file") as File
    expect(file.name).toBe("stock.jsonl")
    expect(file.type).toBe("application/jsonl")
    expect(Buffer.from(await file.arrayBuffer())).toEqual(content)
    expect(form.has("import_file_name")).toBe(false)
  })

  it("refuses a file over 8388608 bytes and a URL, and sends nothing", async () => {
    const { requests, fetch } = stubFetch({})
    const tool = createImportTool({ client: clientWith(fetch) })
    const oversized = `data:application/jsonl;base64,${Buffer.alloc(
      8388608 + 1,
    ).toString("base64")}`

    const tooBig = await tool.handler(
      { body: { import_file: oversized } } as Parameters<
        typeof tool.handler
      >[0],
      ctxWith(),
    )
    const url = await tool.handler(
      { body: { import_file: "https://example.com/file" } } as Parameters<
        typeof tool.handler
      >[0],
      ctxWith(),
    )

    expect(tooBig.isError).toBe(true)
    expect(tooBig.content).toEqual([
      {
        type: "text",
        text: "import_file is 8388609 bytes, over the 8388608 bytes this tool accepts",
      },
    ])
    expect(url.isError).toBe(true)
    expect(requests).toHaveLength(0)
  })

  it("marks the import_file field with x-mcp-file and its size limit", () => {
    const tool = listed.find(
      ({ name }) => name === "inventories_create_import",
    )!
    const body = (tool.inputSchema.properties as Record<string, any>).body

    expect(body.properties.import_file).toMatchObject({
      type: "string",
      format: "uri",
      "x-mcp-file": { maxSize: 8388608 },
    })
  })

  it("sends a call through the given client and returns the data", async () => {
    const response = { data: [] }
    const { requests, fetch } = stubFetch(response)
    const mcpClient = await connect(tools({ client: clientWith(fetch) }))

    const result = await mcpClient.callTool({
      name: "inventories_list_stock",
      arguments: { query: { "page[limit]": 10 } },
    })

    expect(requests).toHaveLength(1)
    const url = new URL(requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/inventories`)
    expect(url.searchParams.get("page[limit]")).toBe("10")
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(result.structuredContent).toEqual(response)
  })
})

describe("the main entry", () => {
  it("exports no MCP code", () => {
    expect(main).not.toHaveProperty("tools")
    expect(main).not.toHaveProperty("listStockTool")
  })
})
