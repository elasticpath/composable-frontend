import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

// The spec plugins are CommonJS and live outside this package's src.
const require = createRequire(import.meta.url)

// packages/sdks/specs has no node_modules, so resolve the plugin's own imports from this package.
const Module = require("node:module")
const here = path.dirname(fileURLToPath(import.meta.url))
const fromThisPackage = {
  id: "<test-harness>",
  filename: path.join(here, "resolver.js"),
  paths: Module._nodeModulePaths(here),
}
const resolveFilename = Module._resolveFilename
Module._resolveFilename = function (
  request: string,
  parent: unknown,
  ...rest: unknown[]
) {
  const from = request.startsWith("@redocly/") ? fromThisPackage : parent
  return resolveFilename.call(this, request, from, ...rest)
}

const PathAdd = require("../../../specs/plugins/decorators/path-add.js")

let dir: string

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "path-add-"))
})

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

// mergeRef is resolved against the redocly config unless absolute, so fixtures use absolute paths.
function fixture(name: string, yaml: string) {
  const file = path.join(dir, name)
  fs.writeFileSync(file, yaml, "utf-8")
  return file
}

function add(root: any, mergeRef?: string | string[]) {
  const report = vi.fn()
  PathAdd({ mergeRef }).Root.leave(root, {
    report,
    location: { key: () => "root" },
  })
  return report
}

function messageOf(report: ReturnType<typeof vi.fn>) {
  return report.mock.calls[0]?.[0]?.message ?? ""
}

function specWithEntries() {
  return {
    openapi: "3.1.0",
    paths: {
      "/v2/settings/extensions/custom-apis/{custom-api-id}/entries": {
        get: {
          operationId: "ListCustomAPIEntries",
          responses: {
            "200": { $ref: "#/components/responses/ListOfEntries" },
          },
        },
      },
    },
    components: {
      parameters: {},
      responses: { ListOfEntries: { description: "ok" } },
    },
  }
}

const slugOperation = [
  "paths:",
  "  /v2/extensions/{custom-api-slug}:",
  "    parameters:",
  "      - $ref: '#/components/parameters/CustomAPISlug'",
  "    get:",
  "      operationId: GetCustomEntriesSettings",
  "      responses:",
  "        '200':",
  "          $ref: '#/components/responses/ListOfEntries'",
  "components:",
  "  parameters:",
  "    CustomAPISlug:",
  "      name: custom-api-slug",
  "      in: path",
  "      required: true",
  "      schema:",
  "        type: string",
].join("\n")

describe("path-add", () => {
  it("adds a path and the components it brings", () => {
    const root: any = specWithEntries()
    const report = add(root, fixture("slug.yaml", slugOperation))
    expect(report).not.toHaveBeenCalled()
    expect(root.paths["/v2/extensions/{custom-api-slug}"].get.operationId).toBe(
      "GetCustomEntriesSettings",
    )
    expect(
      root.paths["/v2/settings/extensions/custom-apis/{custom-api-id}/entries"],
    ).toBeDefined()
    expect(root.components.parameters.CustomAPISlug.in).toBe("path")
    expect(root.components.responses.ListOfEntries).toBeDefined()
  })

  it("is a no-op without a mergeRef", () => {
    const root: any = specWithEntries()
    const report = add(root)
    expect(report).not.toHaveBeenCalled()
    expect(root).toEqual(specWithEntries())
  })

  it("reports a path the spec already has", () => {
    const root: any = specWithEntries()
    root.paths["/v2/extensions/{custom-api-slug}"] = {}
    const report = add(root, fixture("slug.yaml", slugOperation))
    expect(report).toHaveBeenCalledTimes(1)
    expect(messageOf(report)).toContain("slug.yaml")
    expect(messageOf(report)).toContain("Delete the override")
  })

  it("reports the same route under another parameter name", () => {
    const root: any = specWithEntries()
    root.paths["/v2/extensions/{slug}"] = {}
    const report = add(root, fixture("slug.yaml", slugOperation))
    expect(report).toHaveBeenCalledTimes(1)
    expect(messageOf(report)).toContain('"/v2/extensions/{slug}"')
  })

  it("reports an operationId the spec already has", () => {
    const root: any = specWithEntries()
    root.paths["/v2/elsewhere"] = {
      get: { operationId: "GetCustomEntriesSettings", responses: {} },
    }
    const report = add(root, fixture("slug.yaml", slugOperation))
    expect(report).toHaveBeenCalledTimes(1)
    expect(messageOf(report)).toContain("GetCustomEntriesSettings")
  })

  it("reports a component the spec already has", () => {
    const root: any = specWithEntries()
    root.components.parameters.CustomAPISlug = { name: "custom-api-slug" }
    const report = add(root, fixture("slug.yaml", slugOperation))
    expect(report).toHaveBeenCalledTimes(1)
    expect(messageOf(report)).toContain("components.parameters.CustomAPISlug")
  })

  it("reports a $ref to a component neither side has", () => {
    const root: any = specWithEntries()
    delete root.components.responses.ListOfEntries
    const report = add(root, fixture("slug.yaml", slugOperation))
    expect(report).toHaveBeenCalledTimes(1)
    expect(messageOf(report)).toContain("#/components/responses/ListOfEntries")
  })
})
