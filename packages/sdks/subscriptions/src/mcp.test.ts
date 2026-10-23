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
import {
  createOfferingTool,
  listOfferingsTool,
  createImportTool,
  tools,
} from "./mcp"
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
  main.createSubscriptionsClient({
    baseUrl,
    token: "pre-issued",
    fetch,
    retry: false,
    config,
  })

const ctxWith = (signal = new AbortController().signal) =>
  ({ mcpReq: { signal } }) as Parameters<Tool["handler"]>[1]

async function connect(registered: Tool[]) {
  const server = new McpServer({ name: "subscriptions", version: "1.0.0" })
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
  "../../specs/overrides/mcp/subscriptions/",
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
  it("holds 86 tools with valid, unique names, in operation order", () => {
    const names = tools().map((tool) => tool.name)

    expect(names).toHaveLength(86)
    for (const name of names) expect(name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/)
    expect(new Set(names).size).toBe(86)
    expect(tools().map((tool) => operationOf(tool).id)).toEqual(
      functionNamesInOperationOrder().map((name) => `subscriptions.${name}`),
    )
  })

  it("exports one tool factory for each operation", () => {
    const factories = Object.keys(mcp).filter((name) => name.endsWith("Tool"))

    expect(factories).toHaveLength(86)
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
        if ("body" in tool.config.inputSchema.shape && method !== "GET")
          args.body = {}

        await tool.handler(args, ctxWith())

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
    const result = await listOfferingsTool().handler({}, ctxWith())

    expect(viaDefault.requests).toHaveLength(1)
    expect(viaDefault.requests[0]!.url).toBe(
      `${original.baseUrl}/v2/subscriptions/offerings`,
    )
    expect(result.structuredContent).toEqual(response)
  })

  it("sends the credentials of a default client configured from a subscriptions client", async () => {
    defaultClient.setConfig(clientWith(viaDefault.fetch).getConfig())

    await listOfferingsTool().handler({}, ctxWith())

    expect(viaDefault.requests[0]!.headers.get("Authorization")).toBe(
      "Bearer pre-issued",
    )
  })

  it("uses a given client instead of the default", async () => {
    const viaGiven = stubFetch(response)

    await listOfferingsTool({ client: clientWith(viaGiven.fetch) }).handler(
      {},
      ctxWith(),
    )

    expect(viaDefault.requests).toHaveLength(0)
    expect(viaGiven.requests).toHaveLength(1)
    const url = new URL(viaGiven.requests[0]!.url)
    expect(url.origin + url.pathname).toBe(
      `${baseUrl}/v2/subscriptions/offerings`,
    )
  })

  it("sends headers configured on the client with every tool call", async () => {
    const { requests, fetch } = stubFetch(response)
    const client = clientWith(fetch, {
      headers: { "EP-Store-Id": "store-1", "EP-Org-Id": "org-1" },
    })

    await listOfferingsTool({ client }).handler({}, ctxWith())

    expect(requests[0]!.headers.get("EP-Store-Id")).toBe("store-1")
    expect(requests[0]!.headers.get("EP-Org-Id")).toBe("org-1")
  })
})

describe("a tool's handler", () => {
  it("aborts the request when the MCP request is cancelled", async () => {
    const { requests, fetch } = stubFetch({})
    const controller = new AbortController()

    await listOfferingsTool({ client: clientWith(fetch) }).handler(
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

    const result = await listOfferingsTool({
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

    const result = await listOfferingsTool({
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

  it("leaves the full spec text to the SDK function's doc comment", () => {
    expect(docCommentOf("createDunningRule").length).toBeGreaterThan(600)
  })
})

describe("the subscriptions tools on an MCP server", () => {
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

  it.each([
    ["subscriptions_create_subscription", 26_900],
    ["subscriptions_build_offering", 12_800],
    ["subscriptions_create_job", 7_500],
  ])("lists the input schema of %s in at most %i characters", (name, limit) => {
    const tool = listed.find((candidate) => candidate.name === name)!

    expect(JSON.stringify(tool.inputSchema).length).toBeLessThanOrEqual(limit)
  })

  it("lists all 86, each passing the MCP SDK's Tool spec type", () => {
    expect(listed).toHaveLength(86)
    for (const tool of listed) {
      expect(isSpecType.Tool(tool), tool.name).toBe(true)
    }
  })

  it("marks createSubscriptionProrationPreview as read-only, from the x-mcp-risk override in the spec", () => {
    const tool = listed.find(
      ({ name }) =>
        name === "subscriptions_create_subscription_proration_preview",
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
      listOfferingsTool({ client: clientWith(fetch) }),
    ])

    const result = await mcpClient.callTool({
      name: "subscriptions_list_offerings",
      arguments: { query: { colour: "red" } },
    })

    expect(result.isError).toBe(true)
    expect(requests).toHaveLength(0)
  })

  it("keeps a body attribute the spec does not list when the tool is called through an MCP server", async () => {
    const { requests, fetch } = stubFetch({})
    const mcpClient = await connect([
      createOfferingTool({ client: clientWith(fetch) }),
    ])
    const args = {
      body: {
        data: {
          type: "subscription_offering",
          attributes: { name: "Magazine" },
          unlisted_attribute: { nested: true },
        },
        unlisted_attribute: { nested: true },
      },
    }

    const result = await mcpClient.callTool({
      name: "subscriptions_create_offering",
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
      name: "subscriptions_create_import",
      arguments: {
        body: {
          import_file: `data:application/jsonl;base64,${content.toString(
            "base64",
          )}`,
          import_file_name: "subscribers.jsonl",
          external_ref: "subscriptions-import-1",
        },
      },
    })

    expect(result.isError).toBeFalsy()
    expect(requests[0]!.headers.get("Content-Type")).toMatch(
      /^multipart\/form-data; boundary=/,
    )
    const form = await requests[0]!.formData()
    const file = form.get("import_file") as File
    expect(file.name).toBe("subscribers.jsonl")
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
      ({ name }) => name === "subscriptions_create_import",
    )!
    const body = (tool.inputSchema.properties as Record<string, any>).body

    expect(body.properties.import_file).toMatchObject({
      type: "string",
      format: "uri",
      "x-mcp-file": { maxSize: 8388608 },
    })
  })

  it("lets an update clear a subscriber's payment authority with null", async () => {
    const { requests, fetch } = stubFetch({ data: {} })
    const mcpClient = await connect(tools({ client: clientWith(fetch) }))
    const body = {
      data: {
        id: "00000000-0000-4000-8000-000000000000",
        type: "subscription_subscriber",
        attributes: { payment_authority: null },
      },
    }

    const result = await mcpClient.callTool({
      name: "subscriptions_update_subscriber",
      arguments: {
        path: { subscriber_uuid: "00000000-0000-4000-8000-000000000000" },
        body,
      },
    })

    expect(result.isError, JSON.stringify(result.content)).toBeFalsy()
    expect(await requests[0]!.json()).toEqual(body)
  })

  it("sends a call through the given client and returns the data", async () => {
    const response = { data: [] }
    const { requests, fetch } = stubFetch(response)
    const mcpClient = await connect(tools({ client: clientWith(fetch) }))

    const result = await mcpClient.callTool({
      name: "subscriptions_list_offerings",
      arguments: {},
    })

    expect(requests).toHaveLength(1)
    const url = new URL(requests[0]!.url)
    expect(url.origin + url.pathname).toBe(
      `${baseUrl}/v2/subscriptions/offerings`,
    )
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(result.structuredContent).toEqual(response)
  })
})

describe("the main entry", () => {
  it("exports no MCP code", () => {
    expect(main).not.toHaveProperty("tools")
    expect(main).not.toHaveProperty("listOfferingsTool")
  })
})
