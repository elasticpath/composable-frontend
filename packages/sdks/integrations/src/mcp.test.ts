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
import { createIntegrationTool, listIntegrationsTool, tools } from "./mcp"
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
  main.createIntegrationsClient({
    baseUrl,
    token: "pre-issued",
    fetch,
    retry: false,
    config,
  })

const ctxWith = (signal = new AbortController().signal) =>
  ({ mcpReq: { signal } }) as Parameters<Tool["handler"]>[1]

async function connect(registered: Tool[]) {
  const server = new McpServer({ name: "integrations", version: "1.0.0" })
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
  "../../specs/overrides/mcp/integrations/",
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
  it("holds 9 tools with valid, unique names, in operation order", () => {
    const names = tools().map((tool) => tool.name)

    expect(names).toHaveLength(9)
    for (const name of names) expect(name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/)
    expect(new Set(names).size).toBe(9)
    expect(tools().map((tool) => operationOf(tool).id)).toEqual(
      functionNamesInOperationOrder().map((name) => `integrations.${name}`),
    )
  })

  it("exports one tool factory for each operation", () => {
    const factories = Object.keys(mcp).filter((name) => name.endsWith("Tool"))

    expect(factories).toHaveLength(9)
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
    const result = await listIntegrationsTool().handler({}, ctxWith())

    expect(viaDefault.requests).toHaveLength(1)
    expect(viaDefault.requests[0]!.url).toBe(`${original.baseUrl}/integrations`)
    expect(result.structuredContent).toEqual(response)
  })

  it("sends the credentials of a default client configured from a integrations client", async () => {
    defaultClient.setConfig(clientWith(viaDefault.fetch).getConfig())

    await listIntegrationsTool().handler({}, ctxWith())

    expect(viaDefault.requests[0]!.headers.get("Authorization")).toBe(
      "Bearer pre-issued",
    )
  })

  it("uses a given client instead of the default", async () => {
    const viaGiven = stubFetch(response)

    await listIntegrationsTool({ client: clientWith(viaGiven.fetch) }).handler(
      {},
      ctxWith(),
    )

    expect(viaDefault.requests).toHaveLength(0)
    expect(viaGiven.requests).toHaveLength(1)
    const url = new URL(viaGiven.requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/integrations`)
  })

  it("sends headers configured on the client with every tool call", async () => {
    const { requests, fetch } = stubFetch(response)
    const client = clientWith(fetch, {
      headers: { "EP-Store-Id": "store-1", "EP-Org-Id": "org-1" },
    })

    await listIntegrationsTool({ client }).handler({}, ctxWith())

    expect(requests[0]!.headers.get("EP-Store-Id")).toBe("store-1")
    expect(requests[0]!.headers.get("EP-Org-Id")).toBe("org-1")
  })
})

describe("a tool's handler", () => {
  it("aborts the request when the MCP request is cancelled", async () => {
    const { requests, fetch } = stubFetch({})
    const controller = new AbortController()

    await listIntegrationsTool({ client: clientWith(fetch) }).handler(
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

    const result = await listIntegrationsTool({
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

    const result = await listIntegrationsTool({
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

describe("the integrations tools on an MCP server", () => {
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

  it("lists all 9, each passing the MCP SDK's Tool spec type", () => {
    expect(listed).toHaveLength(9)
    for (const tool of listed) {
      expect(isSpecType.Tool(tool), tool.name).toBe(true)
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

  it("keeps a body attribute the spec does not list when the tool is called through an MCP server", async () => {
    const { requests, fetch } = stubFetch({})
    const mcpClient = await connect([
      createIntegrationTool({ client: clientWith(fetch) }),
    ])
    const args = {
      body: {
        data: {
          type: "integration",
          observers: "sample",
          integration_type: "webhook",
          name: "Order shipping notification",
          configuration: {
            url: "https://sqs.eu-west-1.amazonaws.com/123456789/epcc-external-queue",
            aws_access_key_id: "****************JIMB",
            aws_secret_access_key: "************************************HK4o",
            region: "eu-west-1",
          },
          unlisted_attribute: { nested: true },
        },
        unlisted_attribute: { nested: true },
      },
    }

    const result = await mcpClient.callTool({
      name: "integrations_create_integration",
      arguments: args,
    })

    expect(result.isError).toBeFalsy()
    expect(await requests[0]!.json()).toMatchObject(args.body)
  })

  it("sends a call through the given client and returns the data", async () => {
    const response = { data: [] }
    const { requests, fetch } = stubFetch(response)
    const mcpClient = await connect(tools({ client: clientWith(fetch) }))

    const result = await mcpClient.callTool({
      name: "integrations_list_integrations",
      arguments: {},
    })

    expect(requests).toHaveLength(1)
    const url = new URL(requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/integrations`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(result.structuredContent).toEqual(response)
  })
})

describe("the main entry", () => {
  it("exports no MCP code", () => {
    expect(main).not.toHaveProperty("tools")
    expect(main).not.toHaveProperty("listIntegrationsTool")
  })
})
