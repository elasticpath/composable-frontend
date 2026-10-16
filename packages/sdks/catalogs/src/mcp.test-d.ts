import { describe, expectTypeOf, it } from "vitest"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { GetCatalogsData } from "./client/types.gen"
import { getCatalogsTool, tools } from "./mcp"

declare const server: McpServer

describe("registering the generated tools", () => {
  it("registers one tool with its name, config and handler", () => {
    const tool = getCatalogsTool()

    server.registerTool(tool.name, tool.config, tool.handler)
  })

  it("registers every tool from tools()", () => {
    tools().forEach((t) => server.registerTool(t.name, t.config, t.handler))
  })

  it("registers only the read-only tools", () => {
    tools()
      .filter(
        (t) => t.config._meta["com.elasticpath/operation"].risk === "read",
      )
      .forEach((t) => server.registerTool(t.name, t.config, t.handler))
  })

  it("keeps typed arguments in a wrapped handler", () => {
    const tool = getCatalogsTool()

    server.registerTool(tool.name, tool.config, (args, extra) => {
      expectTypeOf(args.query).toEqualTypeOf<GetCatalogsData["query"]>()
      // @ts-expect-error
      tool.handler({ query: { colour: "red" } }, extra)
      return tool.handler(args, extra)
    })
  })

  it("registers every tool with an extended input that sets a header", () => {
    tools().forEach((t) =>
      server.registerTool(
        t.name,
        {
          ...t.config,
          inputSchema: t.config.inputSchema.extend({
            store_id: z.string().describe("The Elastic Path store to act on."),
          }),
        },
        ({ store_id, ...args }, extra) =>
          t.handler(
            { ...args, headers: { ...args.headers, "EP-Store-Id": store_id } },
            extra,
          ),
      ),
    )
  })
})
