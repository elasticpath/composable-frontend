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

const generate = (directory: string, dryRun = false) =>
  createClient({
    dryRun,
    input: fixture,
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
  config: { description: string; inputSchema: z.ZodType }
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
      "fixture_list_legacy_widgets",
      "fixture_list_widgets",
    ])
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

  it("starts a deprecated operation's description with Deprecated", () => {
    expect(toolNamed("fixture_list_widgets").config.description).toBe(
      "Deprecated. Lists every widget.",
    )
  })

  it("does not repeat Deprecated when the description already starts with it", () => {
    expect(toolNamed("fixture_list_legacy_widgets").config.description).toBe(
      "Deprecated. Use listWidgets instead.",
    )
  })

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
