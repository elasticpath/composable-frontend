import { describe, expect, it, vi } from "vitest"
import { ToolSchema } from "@modelcontextprotocol/sdk/types.js"
import type { Tool } from "@modelcontextprotocol/sdk/types.js"
import { Ajv2020 } from "ajv/dist/2020.js"
import addFormats from "ajv-formats"
import * as main from "./index"
import {
  OPERATION_META_KEY,
  buildTools,
  createEndpointTools,
  operations,
  toolName,
} from "./mcp"
import * as zod from "./zod"

const FACT_KEYS = [
  "agentUnsafe",
  "deprecated",
  "description",
  "id",
  "idempotent",
  "method",
  "paging",
  "path",
  "requiredSections",
  "risk",
  "title",
]
const BINDING_KEYS = ["path", "query", "headers", "body", "response"] as const

const operation = (fn: string) => {
  const found = operations.find(({ facts }) => facts.id === `catalogs.${fn}`)
  if (!found) throw new Error(`No catalogs operation ${fn}`)
  return found
}

const functionOf = (id: string) => id.slice("catalogs.".length)

function compile2020(schema: object) {
  const ajv = new Ajv2020({ strict: true, allowUnionTypes: true })
  addFormats(ajv)
  return ajv.compile(schema)
}

describe("the ./mcp export", () => {
  it("holds all 30 catalogs operations, once each", () => {
    const ids = operations.map(({ facts }) => facts.id)

    expect(ids).toHaveLength(30)
    expect(new Set(ids).size).toBe(30)
  })

  it("gives every operation complete facts", () => {
    for (const { facts } of operations) {
      expect(Object.keys(facts).sort()).toEqual(FACT_KEYS)
      expect(facts.id).toMatch(/^catalogs\.[a-z][A-Za-z]+$/)
      expect(["GET", "POST", "PUT", "DELETE"]).toContain(facts.method)
      expect(facts.path).toMatch(/^\/catalogs/)
      expect(facts.title).not.toBe("")
      expect(facts.description).not.toBe("")
      expect(["read", "create", "update", "delete"]).toContain(facts.risk)
      expect(typeof facts.idempotent).toBe("boolean")
      expect(typeof facts.deprecated).toBe("boolean")
      expect(typeof facts.agentUnsafe).toBe("boolean")
    }
  })

  it("binds every operation to the SDK function its id names, as the main entry exports it", () => {
    for (const { facts, bindings } of operations) {
      const name = functionOf(facts.id) as keyof typeof main

      expect(bindings.fn).toBe(main[name])
    }
  })

  it("binds every operation's zod schemas from the ./zod export", () => {
    const exported = new Set<unknown>(Object.values(zod))

    for (const { bindings } of operations) {
      expect(bindings.response).toBeDefined()
      for (const key of BINDING_KEYS) {
        if (bindings[key]) expect(exported.has(bindings[key])).toBe(true)
      }
    }
    expect(operation("getCatalogs").bindings).toMatchObject({
      query: zod.zGetCatalogsQuery,
      response: zod.zGetCatalogsResponse,
    })
  })

  it("binds and requires path parameters for every templated path", () => {
    for (const { facts, bindings } of operations) {
      const templated = facts.path.includes("{")

      expect(Boolean(bindings.path)).toBe(templated)
      expect(facts.requiredSections.includes("path")).toBe(templated)
    }
  })

  it("requires the body only where the spec does", () => {
    expect(operation("createCatalog").facts.requiredSections).toEqual(["body"])
    expect(operation("getCatalogs").facts.requiredSections).toEqual([])
  })

  it("finds paging in page[limit] and page[offset]", () => {
    expect(operation("getCatalogs").facts.paging).toEqual({
      limit: "page[limit]",
      offset: "page[offset]",
    })
    expect(operation("getCatalogById").facts.paging).toBeNull()

    for (const { facts, bindings } of operations) {
      const shape = (bindings.query as { shape?: object } | undefined)?.shape
      expect(facts.paging !== null).toBe(
        Boolean(shape && "page[limit]" in shape),
      )
    }
  })

  it("takes the risk tier from the HTTP method", () => {
    expect(operation("getCatalogs").facts.risk).toBe("read")
    expect(operation("createCatalog").facts.risk).toBe("create")
    expect(operation("updateCatalog").facts.risk).toBe("update")
    expect(operation("deleteCatalogById").facts.risk).toBe("delete")
  })

  it("makes validateCatalogRules a repeatable read, from the x-mcp-risk override in the spec", () => {
    expect(operation("validateCatalogRules").facts).toMatchObject({
      method: "POST",
      risk: "read",
      idempotent: true,
    })
  })

  it("marks no operation agent-unsafe, because the spec sets no x-mcp-agent-unsafe override", () => {
    expect(operations.filter(({ facts }) => facts.agentUnsafe)).toEqual([])
  })
})

describe("the tools built from the ./mcp export", () => {
  const tools = buildTools(operations, { outputSchema: true })

  it("have valid, unique names", () => {
    const names = tools.map((tool) => tool.name)

    for (const name of names) expect(name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/)
    expect(new Set(names).size).toBe(names.length)
    expect(toolName(operation("getCatalogById").facts)).toBe(
      "catalogs_get_catalog_by_id",
    )
  })

  it("pass the MCP SDK's ToolSchema unchanged", () => {
    for (const tool of tools) {
      const typed: Tool = tool
      expect(ToolSchema.parse(typed)).toEqual(tool)
    }
  })

  it("have input and output schemas that compile as JSON Schema 2020-12", () => {
    for (const tool of tools) {
      expect(() => compile2020(tool.inputSchema), tool.name).not.toThrow()
      if (tool.outputSchema) {
        expect(() => compile2020(tool.outputSchema!), tool.name).not.toThrow()
      }
    }
  })

  it("write the 64-bit paging fields as integers that a 2020-12 validator checks", () => {
    const tool = tools.find(({ name }) => name === "catalogs_get_catalogs")!
    const query = (tool.inputSchema.properties as Record<string, any>).query
    const validate = compile2020(tool.inputSchema)

    expect(query.properties["page[offset]"]).toMatchObject({
      type: "integer",
      minimum: 0,
      maximum: 10000,
    })
    expect(validate({ query: { "page[offset]": 20 } })).toBe(true)
    expect(validate({ query: { "page[offset]": 20.5 } })).toBe(false)
    expect(validate({ query: { "page[offset]": 10001 } })).toBe(false)
  })

  it("carry no outputSchema for a response with no body", () => {
    const deletes = tools.filter(
      (tool) =>
        (tool._meta?.[OPERATION_META_KEY] as { method: string }).method ===
        "DELETE",
    )

    expect(deletes).toHaveLength(4)
    for (const tool of deletes) expect(tool).not.toHaveProperty("outputSchema")
  })

  it("carry no outputSchema unless asked", () => {
    for (const tool of buildTools(operations)) {
      expect(tool).not.toHaveProperty("outputSchema")
    }
  })
})

describe("calling a catalogs tool", () => {
  const baseUrl = "https://useast.api.elasticpath.com"
  const catalogs = { data: [], links: {}, meta: { results: { total: 0 } } }

  function stubFetch(status: number, body: unknown) {
    const requests: Request[] = []
    const transport = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const request =
          input instanceof Request && init === undefined
            ? input
            : new Request(input, init)
        requests.push(request)
        return new Response(JSON.stringify(body), {
          status,
          headers: { "Content-Type": "application/json" },
        })
      },
    ) as unknown as typeof fetch
    return { requests, transport }
  }

  const toolsWith = (transport: typeof fetch) =>
    createEndpointTools(operations, {
      client: main.createCatalogsClient({
        baseUrl,
        token: "pre-issued",
        fetch: transport,
        retry: false,
      }),
    })

  it("sends the request through the configured client and returns the data", async () => {
    const { requests, transport } = stubFetch(200, catalogs)

    const result = await toolsWith(transport).call("catalogs_get_catalogs", {
      query: { "page[limit]": 10 },
    })

    expect(requests).toHaveLength(1)
    const url = new URL(requests[0]!.url)
    expect(url.origin + url.pathname).toBe(`${baseUrl}/catalogs`)
    expect(url.searchParams.get("page[limit]")).toBe("10")
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(result.structuredContent).toEqual(catalogs)
  })

  it("rejects an unknown query key without sending a request", async () => {
    const { requests, transport } = stubFetch(200, catalogs)

    const result = await toolsWith(transport).call("catalogs_get_catalogs", {
      query: { "page[size]": 10 },
    })

    expect(result.isError).toBe(true)
    expect(requests).toHaveLength(0)
  })

  it("reports the API's error with its status", async () => {
    const body = { errors: [{ status: "404", title: "Not Found" }] }
    const { transport } = stubFetch(404, body)

    const result = await toolsWith(transport).call(
      "catalogs_get_catalog_by_id",
      {
        path: { catalog_id: "missing" },
      },
    )

    expect(result).toEqual({
      isError: true,
      content: [{ type: "text", text: `HTTP 404: ${JSON.stringify(body)}` }],
    })
  })
})

describe("the main entry", () => {
  it("exports no MCP code", () => {
    expect(main).not.toHaveProperty("operations")
    expect(main).not.toHaveProperty("createEndpointTools")
    expect(main).not.toHaveProperty("buildTools")
  })
})
