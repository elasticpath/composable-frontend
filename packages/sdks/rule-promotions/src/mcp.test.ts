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
import { createRulePromotionTool, getRulePromotionsTool, tools } from "./mcp"
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
  main.createRulePromotionsClient({
    baseUrl,
    token: "pre-issued",
    fetch,
    retry: false,
    config,
  })

const ctxWith = (signal = new AbortController().signal) =>
  ({ mcpReq: { signal } }) as Parameters<Tool["handler"]>[1]

async function connect(registered: Tool[]) {
  const server = new McpServer({ name: "rule-promotions", version: "1.0.0" })
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
  "../../specs/overrides/mcp/rule-promotions/",
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
  it("holds 16 tools with valid, unique names, in operation order", () => {
    const names = tools().map((tool) => tool.name)

    expect(names).toHaveLength(16)
    for (const name of names) expect(name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/)
    expect(new Set(names).size).toBe(16)
    expect(tools().map((tool) => operationOf(tool).id)).toEqual(
      functionNamesInOperationOrder().map((name) => `rule_promotions.${name}`),
    )
  })

  it("exports one tool factory for each operation", () => {
    const factories = Object.keys(mcp).filter((name) => name.endsWith("Tool"))

    expect(factories).toHaveLength(16)
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
          path.replace(/\{([^}]+)\}/g, (_match, p) => `p-${p}`),
        )
      },
    )
  })
})

describe("the client a tool calls through", () => {
  const promotions = { data: [], links: {}, meta: { results: { total: 0 } } }
  let original: ReturnType<typeof defaultClient.getConfig>
  let viaDefault: ReturnType<typeof stubFetch>

  beforeEach(() => {
    original = defaultClient.getConfig()
    viaDefault = stubFetch(promotions)
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
    const result = await getRulePromotionsTool().handler({}, ctxWith())

    expect(viaDefault.requests).toHaveLength(1)
    expect(viaDefault.requests[0]!.url).toBe(
      `${original.baseUrl}/v2/rule-promotions`,
    )
    expect(result.structuredContent).toEqual(promotions)
  })

  it("sends the credentials of a default client configured from a rule promotions client", async () => {
    defaultClient.setConfig(clientWith(viaDefault.fetch).getConfig())

    await getRulePromotionsTool().handler({}, ctxWith())

    expect(viaDefault.requests[0]!.headers.get("Authorization")).toBe(
      "Bearer pre-issued",
    )
  })

  it("uses a given client instead of the default", async () => {
    const viaGiven = stubFetch(promotions)

    await getRulePromotionsTool({ client: clientWith(viaGiven.fetch) }).handler(
      { query: { "page[limit]": 10 } },
      ctxWith(),
    )

    expect(viaDefault.requests).toHaveLength(0)
    expect(viaGiven.requests).toHaveLength(1)
    const url = new URL(viaGiven.requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/rule-promotions`)
    expect(url.searchParams.get("page[limit]")).toBe("10")
  })

  it("sends headers configured on the client with every tool call", async () => {
    const { requests, fetch } = stubFetch(promotions)
    const client = clientWith(fetch, {
      headers: { "EP-Store-Id": "store-1", "EP-Org-Id": "org-1" },
    })

    await getRulePromotionsTool({ client }).handler({}, ctxWith())

    expect(requests[0]!.headers.get("EP-Store-Id")).toBe("store-1")
    expect(requests[0]!.headers.get("EP-Org-Id")).toBe("org-1")
  })
})

describe("a tool's handler", () => {
  it("aborts the request when the MCP request is cancelled", async () => {
    const { requests, fetch } = stubFetch({})
    const controller = new AbortController()

    await getRulePromotionsTool({ client: clientWith(fetch) }).handler(
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

    const result = await getRulePromotionsTool({
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

    const result = await getRulePromotionsTool({
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
    expect(docCommentOf("createRulePromotionCodes").length).toBeGreaterThan(
      1024,
    )
  })
})

describe("the rule promotions tools on an MCP server", () => {
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
    ["rule_promotions_update_rule_promotion", 36_100],
    ["rule_promotions_create_rule_promotion", 35_900],
    ["rule_promotions_get_rule_promotions", 3_600],
  ])("lists the input schema of %s in at most %i characters", (name, limit) => {
    const tool = listed.find((candidate) => candidate.name === name)!

    expect(JSON.stringify(tool.inputSchema).length).toBeLessThanOrEqual(limit)
  })

  it("lists all 16, each passing the MCP SDK's Tool spec type", () => {
    expect(listed).toHaveLength(16)
    for (const tool of listed) {
      expect(isSpecType.Tool(tool), tool.name).toBe(true)
    }
  })

  it("writes the paging fields as integers", () => {
    const tool = listed.find(
      ({ name }) => name === "rule_promotions_get_rule_promotions",
    )!
    const query = (tool.inputSchema.properties as Record<string, any>).query

    expect(query.properties["page[offset]"]).toMatchObject({
      type: "integer",
    })
    expect(query.properties["page[limit]"]).toMatchObject({ type: "integer" })
  })

  it("marks anonymizeRulePromotionUsages as a destructive write, from the x-mcp-risk override in the spec", () => {
    const tool = listed.find(
      ({ name }) => name === "rule_promotions_anonymize_rule_promotion_usages",
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
      getRulePromotionsTool({ client: clientWith(fetch) }),
    ])

    const result = await mcpClient.callTool({
      name: "rule_promotions_get_rule_promotions",
      arguments: { query: { colour: "red" } },
    })

    expect(result.isError).toBe(true)
    expect(requests).toHaveLength(0)
  })

  it("keeps a body attribute the spec does not list when the tool is called through an MCP server", async () => {
    const { requests, fetch } = stubFetch({})
    const mcpClient = await connect([
      createRulePromotionTool({ client: clientWith(fetch) }),
    ])
    const body = {
      data: {
        type: "rule_promotion",
        name: "Summer sale",
        enabled: false,
        unlisted_attribute: { nested: true },
        rule_set: {
          currencies: ["USD"],
          unlisted_attribute: { nested: true },
        },
      },
    }

    const result = await mcpClient.callTool({
      name: "rule_promotions_create_rule_promotion",
      arguments: { body },
    })

    expect(result.isError).toBeFalsy()
    expect(await requests[0]!.json()).toMatchObject(body)
  })

  it("lists the condition schema once in the create tool and refers to it from each action", () => {
    const tool = listed.find(
      ({ name }) => name === "rule_promotions_create_rule_promotion",
    )!
    const schema = JSON.stringify(tool.inputSchema)

    expect(Object.keys(tool.inputSchema.$defs ?? {})).toContain(
      "rule_promotions_condition",
    )
    expect(
      schema.split('"$ref":"#/$defs/rule_promotions_condition"').length - 1,
    ).toBeGreaterThan(1)
    expect(
      schema.split("Logical AND condition requiring ALL child conditions")
        .length - 1,
    ).toBe(1)
  })

  describe("a create body with nested conditions, called through an MCP server", () => {
    const nestedConditionBody = () => ({
      data: {
        type: "rule_promotion",
        name: "Spend 50, save 10%",
        enabled: false,
        unlisted_attribute: { nested: true },
        rule_set: {
          currencies: ["USD"],
          actions: [
            {
              strategy: "cart_discount",
              args: ["percent", 10],
              condition: {
                strategy: "and",
                unlisted_attribute: 1,
                children: [
                  {
                    strategy: "cart_total",
                    operator: "gte",
                    args: [5000],
                    unlisted_attribute: "kept",
                  },
                  {
                    strategy: "item_identifier",
                    operator: "in",
                    args: [{ skus: ["sku-1"] }],
                  },
                ],
              },
            },
            {
              strategy: "item_discount",
              args: ["fixed", 100],
              condition: {
                strategy: "item_identifier",
                operator: "in",
                args: [{ skus: ["sku-2"] }],
                unlisted_attribute: [1, 2],
              },
            },
          ],
        },
      },
    })

    async function create(body: unknown) {
      const { requests, fetch } = stubFetch({})
      const mcpClient = await connect([
        createRulePromotionTool({ client: clientWith(fetch) }),
      ])
      const result = await mcpClient.callTool({
        name: "rule_promotions_create_rule_promotion",
        arguments: { body },
      })
      return { result, requests }
    }

    it("accepts it and sends every unlisted attribute, at every depth", async () => {
      const body = nestedConditionBody()

      const { result, requests } = await create(body)

      expect(result.isError).toBeFalsy()
      expect(await requests[0]!.json()).toEqual(body)
    })

    it.each([
      [
        "a condition strategy the API does not list",
        (body: any) => {
          body.data.rule_set.actions[1].condition.strategy = "item_colour"
        },
      ],
      [
        "an operator the item identifier condition does not list",
        (body: any) => {
          body.data.rule_set.actions[1].condition.operator = "near"
        },
      ],
      [
        "an item condition with no skus list",
        (body: any) => {
          body.data.rule_set.actions[1].condition.args = [{ skus: "sku-2" }]
        },
      ],
      [
        "a percent over 100",
        (body: any) => {
          body.data.rule_set.actions[0].args = ["percent", 101]
        },
      ],
    ])("rejects it with %s, without sending it", async (_case, change) => {
      const body = nestedConditionBody()
      change(body)

      const { result, requests } = await create(body)

      expect(result.isError).toBe(true)
      expect(requests).toHaveLength(0)
    })
  })

  it("sends a call through the given client and returns the data", async () => {
    const promotions = { data: [], links: {}, meta: { results: { total: 0 } } }
    const { requests, fetch } = stubFetch(promotions)
    const mcpClient = await connect(tools({ client: clientWith(fetch) }))

    const result = await mcpClient.callTool({
      name: "rule_promotions_get_rule_promotions",
      arguments: { query: { "page[limit]": 10 } },
    })

    expect(requests).toHaveLength(1)
    const url = new URL(requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/v2/rule-promotions`)
    expect(url.searchParams.get("page[limit]")).toBe("10")
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(result.structuredContent).toEqual(promotions)
  })
})

describe("the main entry", () => {
  it("exports no MCP code", () => {
    expect(main).not.toHaveProperty("tools")
    expect(main).not.toHaveProperty("getRulePromotionsTool")
  })
})
