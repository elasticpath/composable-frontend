import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { build } from "tsup"
import type { Options } from "tsup"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import path from "node:path"
import tsupConfig from "../tsup.config"

const here = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(here, ".generated-dist")

const SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|^\s*import\s+)["']([^"']+)["']/gm

function specifiersIn(file: string) {
  const source = fs.readFileSync(file, "utf8")
  return [...source.matchAll(SPECIFIER)].map((match) => match[1]!)
}

function importGraph(entry: string) {
  const files = new Set<string>()
  const packages = new Set<string>()
  const pending = [path.join(outDir, entry)]
  while (pending.length > 0) {
    const file = pending.pop()!
    if (files.has(file)) continue
    files.add(file)
    for (const specifier of specifiersIn(file)) {
      if (specifier.startsWith(".")) {
        pending.push(path.resolve(path.dirname(file), specifier))
      } else {
        packages.add(specifier)
      }
    }
  }
  return {
    files: [...files].map((file) => path.relative(outDir, file)),
    packages: [...packages],
  }
}

function builtFiles(directory = outDir): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) return builtFiles(full)
    return /\.(mjs|cjs)$/.test(entry.name) ? [full] : []
  })
}

beforeAll(async () => {
  await build({
    ...(tsupConfig as Options),
    config: false,
    dts: false,
    outDir,
    silent: true,
    sourcemap: false,
  })
}, 120_000)

afterAll(() => {
  fs.rmSync(outDir, { force: true, recursive: true })
})

describe("the built package", () => {
  it.each(["index.mjs", "index.cjs"])(
    "reaches no MCP code from the main entry, %s",
    (entry) => {
      const graph = importGraph(entry)

      expect(graph.files).toContain(
        path.join("client", `sdk.gen.${entry.split(".")[1]}`),
      )
      expect(graph.files.filter((file) => file.includes("mcp"))).toEqual([])
      expect(graph.packages.filter((name) => name.includes("mcp"))).toEqual([])
    },
  )

  it.each(["mcp.mjs", "mcp.cjs"])(
    "reaches the generated tools and @epcc-sdk/sdks-mcp from %s",
    (entry) => {
      const graph = importGraph(entry)
      const extension = entry.split(".")[1]

      expect(graph.files).toContain(path.join("client", `mcp.gen.${extension}`))
      expect(graph.packages).toContain("@epcc-sdk/sdks-mcp")
    },
  )

  it("imports the MCP SDK nowhere, because it is a type-only peer", () => {
    for (const file of builtFiles()) {
      expect(
        specifiersIn(file).filter((name) =>
          name.includes("modelcontextprotocol"),
        ),
        file,
      ).toEqual([])
    }
  })
})
