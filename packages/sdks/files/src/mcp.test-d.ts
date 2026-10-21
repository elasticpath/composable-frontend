import { describe, expectTypeOf, it } from "vitest"
import type { McpServer } from "@modelcontextprotocol/server"
import { z } from "zod"
import type { GetAllFilesData } from "./client/types.gen"
import { createAFileTool, getAllFilesTool, tools } from "./mcp"
import type { Tool } from "./mcp"

declare const server: McpServer

describe("registering the generated tools", () => {
  it("registers one tool with its name, config and handler", () => {
    const tool = getAllFilesTool()

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
    const tool = getAllFilesTool()
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
    const tool = getAllFilesTool()

    server.registerTool(tool.name, tool.config, (args, ctx) => {
      expectTypeOf(args.query).toEqualTypeOf<GetAllFilesData["query"]>()
      // @ts-expect-error
      tool.handler({ query: { colour: "red" } }, ctx)
      return tool.handler(args, ctx)
    })
  })

  it("types an upload's file name field", () => {
    const tool = createAFileTool()

    server.registerTool(tool.name, tool.config, (args, ctx) => {
      expectTypeOf(args.body.file_name).toEqualTypeOf<string | undefined>()
      return tool.handler(
        {
          body: { file: "data:image/png;base64,cG5n", file_name: "photo.png" },
        },
        ctx,
      )
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
