import { describe, expectTypeOf, it } from "vitest"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import type { Client } from "./client/client"
import type { GetCatalogsData } from "./client/types.gen"
import {
  createCatalogTool,
  getCatalogsTool,
  getRulesTool,
  registerTools,
  tools,
} from "./mcp"

type GetCatalogsToolOptions = NonNullable<
  Parameters<typeof getCatalogsTool.call>[0]
>

describe("a generated tool's call", () => {
  it("takes the operation's query and an optional client", () => {
    expectTypeOf<GetCatalogsToolOptions["query"]>().toEqualTypeOf<
      GetCatalogsData["query"]
    >()
    expectTypeOf<GetCatalogsToolOptions["client"]>().toEqualTypeOf<
      Client | undefined
    >()
  })

  it("returns an MCP tool result", () => {
    expectTypeOf(getCatalogsTool.call).returns.toEqualTypeOf<
      Promise<CallToolResult>
    >()
  })

  it("needs no options when the SDK function needs none", () => {
    expectTypeOf(getCatalogsTool.call).toBeCallableWith()
  })

  it("needs options when the SDK function needs them", () => {
    // @ts-expect-error
    createCatalogTool.call()
  })

  it("rejects a query key the operation does not have", () => {
    // @ts-expect-error
    getCatalogsTool.call({ query: { colour: "red" } })
  })

  it("has no throwOnError option", () => {
    // @ts-expect-error
    getCatalogsTool.call({ throwOnError: true })
  })
})

describe("registerTools", () => {
  it("takes all the tools, a hand-picked array and a client", () => {
    const server = {} as McpServer
    const client = {} as Client

    expectTypeOf(registerTools).toBeCallableWith(server, tools)
    expectTypeOf(registerTools).toBeCallableWith(server, tools, { client })
    expectTypeOf(registerTools).toBeCallableWith(server, [
      getCatalogsTool,
      getRulesTool,
    ])
  })
})
