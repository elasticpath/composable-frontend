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
import { createAFileTool, getAllFilesTool, tools } from "./mcp"
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
  main.createFilesClient({
    baseUrl,
    token: "pre-issued",
    fetch,
    retry: false,
    config,
  })

const extraWith = (signal = new AbortController().signal) =>
  ({ signal }) as Parameters<Tool["handler"]>[1]

async function connect(registered: Tool[]) {
  const server = new McpServer({ name: "files", version: "1.0.0" })
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

const overrides = new URL("../../specs/overrides/mcp/files/", import.meta.url)

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
  it("holds 4 tools with valid, unique names, in operation order", () => {
    const names = tools().map((tool) => tool.name)

    expect(names).toHaveLength(4)
    for (const name of names) expect(name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/)
    expect(new Set(names).size).toBe(4)
    expect(tools().map((tool) => operationOf(tool).id)).toEqual(
      functionNamesInOperationOrder().map((name) => `files.${name}`),
    )
  })

  it("exports one tool factory for each operation", () => {
    const factories = Object.keys(mcp).filter((name) => name.endsWith("Tool"))

    expect(factories).toHaveLength(4)
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
  const files = { data: [], links: {}, meta: { results: { total: 0 } } }
  let original: ReturnType<typeof defaultClient.getConfig>
  let viaDefault: ReturnType<typeof stubFetch>

  beforeEach(() => {
    original = defaultClient.getConfig()
    viaDefault = stubFetch(files)
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
    const result = await getAllFilesTool().handler({}, extraWith())

    expect(viaDefault.requests).toHaveLength(1)
    expect(viaDefault.requests[0]!.url).toBe(`${original.baseUrl}/v2/files`)
    expect(result.structuredContent).toEqual(files)
  })

  it("sends the credentials of a default client configured from a files client", async () => {
    defaultClient.setConfig(clientWith(viaDefault.fetch).getConfig())

    await getAllFilesTool().handler({}, extraWith())

    expect(viaDefault.requests[0]!.headers.get("Authorization")).toBe(
      "Bearer pre-issued",
    )
  })

  it("uses a given client instead of the default", async () => {
    const viaGiven = stubFetch(files)

    await getAllFilesTool({ client: clientWith(viaGiven.fetch) }).handler(
      { query: { "page[limit]": 10 } },
      extraWith(),
    )

    expect(viaDefault.requests).toHaveLength(0)
    expect(viaGiven.requests).toHaveLength(1)
    const url = new URL(viaGiven.requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/files`)
    expect(url.searchParams.get("page[limit]")).toBe("10")
  })

  it("sends headers configured on the client with every tool call", async () => {
    const { requests, fetch } = stubFetch(files)
    const client = clientWith(fetch, {
      headers: { "EP-Store-Id": "store-1", "EP-Org-Id": "org-1" },
    })

    await getAllFilesTool({ client }).handler({}, extraWith())

    expect(requests[0]!.headers.get("EP-Store-Id")).toBe("store-1")
    expect(requests[0]!.headers.get("EP-Org-Id")).toBe("org-1")
  })
})

describe("a tool's handler", () => {
  it("aborts the request when the MCP request is cancelled", async () => {
    const { requests, fetch } = stubFetch({})
    const controller = new AbortController()

    await getAllFilesTool({ client: clientWith(fetch) }).handler(
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

    const result = await getAllFilesTool({
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

    const result = await getAllFilesTool({
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
    expect(docCommentOf("getAllFiles").length).toBeGreaterThan(
      getAllFilesTool().config.description!.length,
    )
  })
})

describe("the files tools on an MCP server", () => {
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

  it("lists all 4, each passing the MCP SDK's ToolSchema", () => {
    expect(listed).toHaveLength(4)
    for (const tool of listed) {
      expect(ToolSchema.safeParse(tool).success, tool.name).toBe(true)
    }
  })

  it("writes the paging fields as integers", () => {
    const tool = listed.find(({ name }) => name === "files_get_all_files")!
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

  it("rejects an unknown query key without sending the request", async () => {
    const { requests, fetch } = stubFetch({})
    const mcpClient = await connect([
      getAllFilesTool({ client: clientWith(fetch) }),
    ])

    const result = await mcpClient.callTool({
      name: "files_get_all_files",
      arguments: { query: { colour: "red" } },
    })

    expect(result.isError).toBe(true)
    expect(requests).toHaveLength(0)
  })

  it("uploads a data: URI as a multipart file part when the tool is called through an MCP server", async () => {
    const { requests, fetch } = stubFetch({ data: { id: "file-1" } }, 201)
    const mcpClient = await connect([
      createAFileTool({ client: clientWith(fetch) }),
    ])
    const png = Buffer.from("not really a png")

    const result = await mcpClient.callTool({
      name: "files_create_a_file",
      arguments: {
        body: {
          file: `data:image/png;name=widget.png;base64,${png.toString(
            "base64",
          )}`,
        },
      },
    })

    expect(result.isError).toBeFalsy()
    expect(requests[0]!.method).toBe("POST")
    expect(requests[0]!.headers.get("Content-Type")).toMatch(
      /^multipart\/form-data; boundary=/,
    )
    const file = (await requests[0]!.formData()).get("file") as File
    expect(file.name).toBe("widget.png")
    expect(file.type).toBe("image/png")
    expect(Buffer.from(await file.arrayBuffer())).toEqual(png)
  })

  it("sends a file location as a form field", async () => {
    const { requests, fetch } = stubFetch({ data: { id: "file-1" } }, 201)
    const mcpClient = await connect([
      createAFileTool({ client: clientWith(fetch) }),
    ])

    await mcpClient.callTool({
      name: "files_create_a_file",
      arguments: {
        body: { file_location: "https://example.com/widget.png" },
      },
    })

    const form = await requests[0]!.formData()
    expect(form.get("file_location")).toBe("https://example.com/widget.png")
    expect(form.has("file")).toBe(false)
  })

  it.each([
    [
      "a file over 8 MiB",
      `data:image/png;base64,${Buffer.alloc(8 * 1024 * 1024 + 1).toString(
        "base64",
      )}`,
      "file is 8388609 bytes, over the 8388608 bytes this tool accepts",
    ],
    [
      "a URL in the file field",
      "https://example.com/widget.png",
      "file must be a data: URI",
    ],
  ])(
    "returns an error result and sends nothing for %s",
    async (_case, file, message) => {
      const { requests, fetch } = stubFetch({})
      const mcpClient = await connect([
        createAFileTool({ client: clientWith(fetch) }),
      ])

      const result = await mcpClient.callTool({
        name: "files_create_a_file",
        arguments: { body: { file } },
      })

      expect(result.isError).toBe(true)
      expect((result.content as Array<{ text: string }>)[0]!.text).toContain(
        message,
      )
      expect(requests).toHaveLength(0)
    },
  )

  it("asks for the file as a data: URI string in the listed input schema", () => {
    const tool = listed.find(({ name }) => name === "files_create_a_file")!
    const body = (tool.inputSchema.properties as Record<string, any>).body

    expect(body.properties.file).toMatchObject({
      type: "string",
      format: "uri",
    })
    expect(body.properties.file.description).toContain("data:")
  })

  it("sends a call through the given client and returns the data", async () => {
    const files = { data: [], links: {}, meta: { results: { total: 0 } } }
    const { requests, fetch } = stubFetch(files)
    const mcpClient = await connect(tools({ client: clientWith(fetch) }))

    const result = await mcpClient.callTool({
      name: "files_get_all_files",
      arguments: { query: { "page[limit]": 10 } },
    })

    expect(requests).toHaveLength(1)
    const url = new URL(requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/files`)
    expect(url.searchParams.get("page[limit]")).toBe("10")
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(result.structuredContent).toEqual(files)
  })
})

describe("the main entry", () => {
  it("exports no MCP code", () => {
    expect(main).not.toHaveProperty("tools")
    expect(main).not.toHaveProperty("getAllFilesTool")
  })
})
