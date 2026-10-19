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
import {
  createACartTool,
  getACartTool,
  manageCartsTool,
  tools,
  updateACartItemTool,
} from "./mcp"
import type { Tool } from "./mcp"
import { zCheckoutApiBody, zManageCartsBody } from "./zod"

const baseUrl = "https://useast.api.elasticpath.com"
const cartID = "c58ae8ac-d4c7-4d74-8c4a-4b2a7c8dbd3c"
const cartPath = { path: { cartID } }
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
  main.createCartCheckoutOrderClient({
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
    name: "cart-checkout-order",
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
  "../../specs/overrides/mcp/cart-checkout-order/",
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
  it("holds 60 tools with valid, unique names, in operation order", () => {
    const names = tools().map((tool) => tool.name)

    expect(names).toHaveLength(60)
    for (const name of names) expect(name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/)
    expect(new Set(names).size).toBe(60)
    expect(tools().map((tool) => operationOf(tool).id)).toEqual(
      functionNamesInOperationOrder().map(
        (name) => `cart_checkout_order.${name}`,
      ),
    )
  })

  it("exports one tool factory for each operation", () => {
    const factories = Object.keys(mcp).filter((name) => name.endsWith("Tool"))

    expect(factories).toHaveLength(60)
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
  const carts = { data: [], links: {}, meta: { results: { total: 0 } } }
  let original: ReturnType<typeof defaultClient.getConfig>
  let viaDefault: ReturnType<typeof stubFetch>

  beforeEach(() => {
    original = defaultClient.getConfig()
    viaDefault = stubFetch(carts)
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
    const result = await getACartTool().handler(cartPath, extraWith())

    expect(viaDefault.requests).toHaveLength(1)
    expect(viaDefault.requests[0]!.url).toBe(
      `${original.baseUrl}/v2/carts/${cartID}`,
    )
    expect(result.structuredContent).toEqual(carts)
  })

  it("sends the credentials of a default client configured from a cart-checkout-order client", async () => {
    defaultClient.setConfig(clientWith(viaDefault.fetch).getConfig())

    await getACartTool().handler(cartPath, extraWith())

    expect(viaDefault.requests[0]!.headers.get("Authorization")).toBe(
      "Bearer pre-issued",
    )
  })

  it("uses a given client instead of the default", async () => {
    const viaGiven = stubFetch(carts)

    await getACartTool({ client: clientWith(viaGiven.fetch) }).handler(
      { ...cartPath, query: { include: ["promotions"] } },
      extraWith(),
    )

    expect(viaDefault.requests).toHaveLength(0)
    expect(viaGiven.requests).toHaveLength(1)
    const url = new URL(viaGiven.requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/carts/${cartID}`)
    expect(url.searchParams.get("include")).toBe("promotions")
  })

  it("sends headers configured on the client with every tool call", async () => {
    const { requests, fetch } = stubFetch(carts)
    const client = clientWith(fetch, {
      headers: { "EP-Store-Id": "store-1", "EP-Org-Id": "org-1" },
    })

    await getACartTool({ client }).handler(cartPath, extraWith())

    expect(requests[0]!.headers.get("EP-Store-Id")).toBe("store-1")
    expect(requests[0]!.headers.get("EP-Org-Id")).toBe("org-1")
  })
})

describe("a tool's handler", () => {
  it("aborts the request when the MCP request is cancelled", async () => {
    const { requests, fetch } = stubFetch({})
    const controller = new AbortController()

    await getACartTool({ client: clientWith(fetch) }).handler(
      cartPath,
      extraWith(controller.signal),
    )
    expect(requests[0]!.signal.aborted).toBe(false)
    controller.abort()

    expect(requests[0]!.signal.aborted).toBe(true)
  })

  it("returns an API error as an isError result with the HTTP status", async () => {
    const errors = { errors: [{ status: 404, title: "Not Found" }] }
    const { fetch } = stubFetch(errors, 404)

    const result = await getACartTool({ client: clientWith(fetch) }).handler(
      cartPath,
      extraWith(),
    )

    expect(result).toEqual({
      isError: true,
      content: [{ type: "text", text: `HTTP 404: ${JSON.stringify(errors)}` }],
    })
  })

  it("returns a network failure as an isError result with its message", async () => {
    const fetch = (async () => {
      throw new TypeError("fetch failed")
    }) as typeof globalThis.fetch

    const result = await getACartTool({ client: clientWith(fetch) }).handler(
      cartPath,
      extraWith(),
    )

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
    expect(docCommentOf("createCartPaymentIntent").length).toBeGreaterThan(1024)
  })
})

describe("the cart-checkout-order tools on an MCP server", () => {
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
    ["cart_checkout_order_payment_setup", 12_200],
    ["cart_checkout_order_manage_carts", 11_100],
    ["cart_checkout_order_bulk_add_tax_items_to_cart", 7_900],
    ["cart_checkout_order_checkout_api", 7_600],
    ["cart_checkout_order_bulk_update_items_in_cart", 3_500],
  ])("lists the input schema of %s in at most %i characters", (name, limit) => {
    const tool = listed.find((candidate) => candidate.name === name)!

    expect(JSON.stringify(tool.inputSchema).length).toBeLessThanOrEqual(limit)
  })

  it("lists all 60, each passing the MCP SDK's ToolSchema", () => {
    expect(listed).toHaveLength(60)
    for (const tool of listed) {
      expect(ToolSchema.safeParse(tool).success, tool.name).toBe(true)
    }
  })

  it("writes the paging fields as integers", () => {
    const tool = listed.find(
      ({ name }) => name === "cart_checkout_order_get_carts",
    )!
    const query = (tool.inputSchema.properties as Record<string, any>).query

    expect(query.properties["page[offset]"]).toMatchObject({
      type: "integer",
    })
    expect(query.properties["page[limit]"]).toMatchObject({ type: "integer" })
  })

  it.each([
    ["cart_checkout_order_manage_carts", zManageCartsBody],
    ["cart_checkout_order_checkout_api", zCheckoutApiBody],
  ] as const)("keeps every member of the body union in %s", (name, body) => {
    const tool = listed.find((listedTool) => listedTool.name === name)!
    const listedBody = (tool.inputSchema.properties as Record<string, any>).body

    expect(listedBody.anyOf).toHaveLength(body.options.length)
  })

  it("marks anonymizeOrders as destructive, from the x-mcp-risk override in the spec", () => {
    const tool = listed.find(
      ({ name }) => name === "cart_checkout_order_anonymize_orders",
    )!

    expect(tool.annotations).toMatchObject({
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
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
      getACartTool({ client: clientWith(fetch) }),
    ])

    const result = await mcpClient.callTool({
      name: "cart_checkout_order_get_a_cart",
      arguments: { ...cartPath, query: { colour: "red" } },
    })

    expect(result.isError).toBe(true)
    expect(requests).toHaveLength(0)
  })

  it("keeps a custom attribute the spec does not list when createACart is called through an MCP server", async () => {
    const { requests, fetch } = stubFetch({})
    const mcpClient = await connect([
      createACartTool({ client: clientWith(fetch) }),
    ])
    const body = {
      data: {
        name: "Cart",
        unlisted_attribute: { nested: true },
        custom_attributes: {
          membership: {
            type: "string",
            value: "VIP",
            unlisted_attribute: { nested: true },
          },
        },
      },
    }

    const result = await mcpClient.callTool({
      name: "cart_checkout_order_create_a_cart",
      arguments: { body },
    })

    expect(result.isError).toBeFalsy()
    expect(await requests[0]!.json()).toMatchObject(body)
  })

  it("keeps the attributes the spec does not list in the cart item manageCarts is given", async () => {
    const { requests, fetch } = stubFetch({})
    const mcpClient = await connect([
      manageCartsTool({ client: clientWith(fetch) }),
    ])
    const body = {
      data: {
        type: "cart_item",
        id: "7b8a5e0a-9a0b-4c42-8f5c-6c2f2c6a6b11",
        quantity: 1,
        unlisted_attribute: { nested: true },
        custom_attributes: {
          gift_wrap: {
            type: "boolean",
            value: true,
            unlisted_attribute: { nested: true },
          },
        },
      },
    }

    const result = await mcpClient.callTool({
      name: "cart_checkout_order_manage_carts",
      arguments: { path: { cartID: "cart-1" }, body },
    })

    expect(result.isError).toBeFalsy()
    expect(await requests[0]!.json()).toMatchObject(body)
  })

  it("keeps the attributes the spec does not list in the update updateACartItem is given", async () => {
    const { requests, fetch } = stubFetch({})
    const mcpClient = await connect([
      updateACartItemTool({ client: clientWith(fetch) }),
    ])
    const body = {
      data: {
        quantity: 2,
        unlisted_attribute: { nested: true },
        custom_attributes: {
          gift_wrap: {
            type: "boolean",
            value: true,
            unlisted_attribute: { nested: true },
          },
        },
      },
    }

    const result = await mcpClient.callTool({
      name: "cart_checkout_order_update_a_cart_item",
      arguments: { path: { cartID: "cart-1", cartitemID: "item-1" }, body },
    })

    expect(result.isError).toBeFalsy()
    expect(await requests[0]!.json()).toMatchObject(body)
  })

  it("sends a call through the given client and returns the data", async () => {
    const carts = { data: [], links: {}, meta: { results: { total: 0 } } }
    const { requests, fetch } = stubFetch(carts)
    const mcpClient = await connect(tools({ client: clientWith(fetch) }))

    const result = await mcpClient.callTool({
      name: "cart_checkout_order_get_a_cart",
      arguments: { ...cartPath, query: { include: ["promotions"] } },
    })

    expect(requests).toHaveLength(1)
    const url = new URL(requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/carts/${cartID}`)
    expect(url.searchParams.get("include")).toBe("promotions")
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(result.structuredContent).toEqual(carts)
  })
})

describe("the main entry", () => {
  it("exports no MCP code", () => {
    expect(main).not.toHaveProperty("tools")
    expect(main).not.toHaveProperty("getACartTool")
  })
})
