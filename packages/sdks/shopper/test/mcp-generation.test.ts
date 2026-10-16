import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createClient } from "@hey-api/openapi-ts"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import path from "node:path"
import config from "../openapi-ts.config"

const here = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.join(here, "..")
const committed = path.join(packageRoot, "src/client")
const firstRun = path.join(here, ".generated-mcp-first")
const secondRun = path.join(here, ".generated-mcp-second")
const workspaceBin = path.join(packageRoot, "../../../node_modules/.bin")
const mainEntryFiles = ["index.ts", "sdk.gen.ts", "types.gen.ts", "zod.gen.ts"]
const mcpFiles = ["mcp.gen.ts", "mcp-support.gen.ts"]

const read = (directory: string, file: string) =>
  fs.readFileSync(path.join(directory, file), "utf8")

async function generateInto(directory: string) {
  const userConfig = await config
  await createClient({
    ...userConfig,
    input: path.join(packageRoot, "../specs/bundled/shopper_standalone.yaml"),
    output: { ...(userConfig.output as object), path: directory },
  })
}

beforeAll(async () => {
  process.env.PATH = [workspaceBin, process.env.PATH].join(path.delimiter)
  execFileSync(
    path.join(packageRoot, "node_modules/.bin/redocly"),
    [
      "bundle",
      "shopper-standalone@v1",
      "--config",
      "../specs/config/redocly.yaml",
    ],
    { cwd: packageRoot, stdio: "pipe" },
  )
  await generateInto(firstRun)
  await generateInto(secondRun)
}, 120_000)

afterAll(() => {
  for (const directory of [firstRun, secondRun]) {
    fs.rmSync(directory, { force: true, recursive: true })
  }
})

describe("generating the ./mcp export", () => {
  it("writes the same MCP files byte for byte each time", () => {
    for (const file of mcpFiles) {
      expect(read(secondRun, file), file).toBe(read(firstRun, file))
    }
  })

  it("matches the committed MCP files", () => {
    for (const file of mcpFiles) {
      expect(read(firstRun, file), file).toBe(read(committed, file))
    }
  })

  it("leaves the main entry's generated files as committed", () => {
    for (const file of mainEntryFiles) {
      expect(read(firstRun, file), file).toBe(read(committed, file))
    }
  })

  it("keeps the MCP files out of the generated entry", () => {
    expect(read(firstRun, "index.ts")).not.toContain("mcp")
  })
})
