import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { $, createClient } from "@hey-api/openapi-ts"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import path from "node:path"
import * as z from "zod"
import { mcpTools } from "../../specs/heyapi/mcp-tools"

const here = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.join(here, "..")
const fixture = path.join(here, "fixtures/mcp-tools.yaml")
const output = path.join(here, ".generated-mcp-fixture")
const dryRunOutput = path.join(here, ".generated-mcp-dry-run")

const generate = (
  directory: string,
  dryRun = false,
  input: unknown = fixture,
) =>
  createClient({
    dryRun,
    input: input as string,
    logs: { level: "silent" },
    output: { path: directory, postProcess: [] },
    plugins: [
      { name: "@hey-api/client-fetch" },
      { name: "@hey-api/typescript" },
      { name: "@hey-api/sdk" },
      { name: "zod" },
      mcpTools($, { api: "fixture" }),
    ],
  })

type GeneratedTool = {
  name: string
  config: { title: string; description: string; inputSchema: z.ZodType }
}
let tools: GeneratedTool[]
const toolNamed = (name: string) => tools.find((tool) => tool.name === name)!

beforeAll(async () => {
  fs.rmSync(output, { force: true, recursive: true })
  await generate(output)
  const generated = await import(path.join(output, "mcp.gen.ts"))
  tools = generated.tools()
}, 120_000)

afterAll(() => {
  for (const directory of [output, dryRunOutput]) {
    fs.rmSync(directory, { force: true, recursive: true })
  }
})

describe("the MCP tools plugin", () => {
  it("generates no tool for an operation with a multipart body", () => {
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      "fixture_create_widget",
      "fixture_delete_a_widget",
      "fixture_get_a_widget",
      "fixture_list_legacy_widgets",
      "fixture_list_old_widgets",
      "fixture_list_retired_widgets",
      "fixture_list_widgets",
      "fixture_update_a_widget",
    ])
  })

  it("separates a one-letter word from the next word in a tool name", () => {
    expect(toolNamed("fixture_get_a_widget")).toBeDefined()
  })

  it("writes output that type-checks", () => {
    expect(() =>
      execFileSync(
        path.join(packageRoot, "node_modules/.bin/tsc"),
        [
          "--noEmit",
          "--strict",
          "--skipLibCheck",
          "--target",
          "es2020",
          "--module",
          "esnext",
          "--moduleResolution",
          "bundler",
          "--lib",
          "es2020,dom,dom.iterable",
          path.join(output, "mcp.gen.ts"),
        ],
        { stdio: "pipe" },
      ),
    ).not.toThrow()
  }, 60_000)

  it("describes a tool with the summary and the first paragraph of the description", () => {
    expect(toolNamed("fixture_get_a_widget").config.description).toBe(
      "Get a widget. Returns one widget by its ID.",
    )
  })

  it("describes a tool with the summary alone when the operation has no description", () => {
    expect(toolNamed("fixture_update_a_widget").config.description).toBe(
      "Update a widget",
    )
  })

  it("says it once when the first paragraph only repeats the summary", () => {
    expect(toolNamed("fixture_delete_a_widget").config.description).toBe(
      "Delete a widget.",
    )
  })

  it("titles a tool with the operation's summary", () => {
    expect(toolNamed("fixture_get_a_widget").config.title).toBe("Get a widget")
  })

  it("takes the title and description from x-mcp-title and x-mcp-description", () => {
    const { title, description } = toolNamed("fixture_create_widget").config

    expect(title).toBe("Make a widget")
    expect(description).toBe(
      "Makes one widget. Use it to add a widget to the list.",
    )
  })

  it("starts a deprecated operation's description with Deprecated", () => {
    expect(toolNamed("fixture_list_widgets").config.description).toBe(
      "Deprecated. List widgets. Lists every widget.",
    )
  })

  it("does not repeat Deprecated when the description already starts with it", () => {
    expect(toolNamed("fixture_list_legacy_widgets").config.description).toBe(
      "Deprecated. List legacy widgets. Use listWidgets instead.",
    )
  })

  it("starts an x-mcp-description with Deprecated when the operation is deprecated", () => {
    expect(toolNamed("fixture_list_old_widgets").config.description).toBe(
      "Deprecated. Lists widgets made before 2020.",
    )
  })

  it("leaves an x-mcp-description that already starts with Deprecated as written", () => {
    expect(toolNamed("fixture_list_retired_widgets").config.description).toBe(
      "Deprecated in favour of listing every widget.",
    )
  })

  it.each(["x-mcp-title", "x-mcp-description"])(
    "rejects a %s with no text",
    async (extension) => {
      const spec = {
        openapi: "3.1.0",
        info: { title: "Empty override", version: "1.0.0" },
        paths: {
          "/widgets": {
            get: {
              operationId: "listWidgets",
              summary: "List widgets",
              [extension]: " ",
              responses: { "200": { description: "The widgets." } },
            },
          },
        },
      }

      await expect(generate(dryRunOutput, true, spec)).rejects.toMatchObject({
        originalError: {
          error: { message: `listWidgets needs text in ${extension}` },
        },
      })
    },
  )

  it("leaves out the Authorization header and keeps the other headers", () => {
    const input = z.toJSONSchema(
      toolNamed("fixture_create_widget").config.inputSchema,
    ) as any

    expect(Object.keys(input.properties.headers.properties)).toEqual([
      "EP-Channel",
    ])
  })

  it("writes nothing and does not throw on a dry run", async () => {
    fs.rmSync(dryRunOutput, { force: true, recursive: true })

    await generate(dryRunOutput, true)

    expect(fs.existsSync(dryRunOutput)).toBe(false)
  })
})
