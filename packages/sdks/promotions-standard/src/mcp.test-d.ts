import { describe, expectTypeOf, it } from "vitest"
import type { McpServer } from "@modelcontextprotocol/server"
import { z } from "zod"
import type { DeleteAPromotionData } from "./client/types.gen"
import { deleteAPromotionTool, tools } from "./mcp"
import type { Tool } from "./mcp"

declare const server: McpServer

describe("registering the generated tools", () => {
  it("registers one tool with its name, config and handler", () => {
    const tool = deleteAPromotionTool()

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

  it("rejects a tool without _meta or with an unknown risk", () => {
    const register = (t: Tool) =>
      server.registerTool(t.name, t.config, t.handler)
    const tool = deleteAPromotionTool()
    const { _meta, ...configWithoutMeta } = tool.config
    const withoutMeta = { ...tool, config: configWithoutMeta }
    const unknownRisk = {
      ...tool,
      config: {
        ...tool.config,
        _meta: {
          "com.elasticpath/operation": {
            ..._meta["com.elasticpath/operation"],
            risk: "erase" as const,
          },
        },
      },
    }

    register(tool)
    // @ts-expect-error
    register(withoutMeta)
    // @ts-expect-error
    register(unknownRisk)
  })

  it("keeps typed arguments in a wrapped handler", () => {
    const tool = deleteAPromotionTool()

    server.registerTool(tool.name, tool.config, (args, ctx) => {
      expectTypeOf(args.path).toEqualTypeOf<DeleteAPromotionData["path"]>()
      // @ts-expect-error
      tool.handler({ colour: "red" }, ctx)
      return tool.handler(args, ctx)
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
        ({ store_id, ...args }, ctx) =>
          t.handler(
            { ...args, headers: { ...args.headers, "EP-Store-Id": store_id } },
            ctx,
          ),
      ),
    )
  })
})
