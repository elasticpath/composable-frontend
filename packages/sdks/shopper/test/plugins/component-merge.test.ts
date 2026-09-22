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

const ComponentMerge = require("../../../specs/plugins/decorators/component-merge.js")

let dir: string

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "component-merge-"))
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

function merge(root: any, mergeRef: string | string[]) {
  const report = vi.fn()
  ComponentMerge({ mergeRef }).Root.leave(root, {
    report,
    location: { key: () => "root" },
  })
  return report
}

function messageOf(report: ReturnType<typeof vi.fn>) {
  return report.mock.calls[0]?.[0]?.message ?? ""
}

function specWithOneOperation() {
  return {
    openapi: "3.1.0",
    paths: {
      "/v2/carts/{cartID}/items": {
        get: {
          operationId: "getCartItems",
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Original" },
                },
              },
            },
          },
        },
      },
    },
    components: { schemas: { Original: { type: "object" } } },
  }
}

describe("component-merge", () => {
  it("merges a single mergeRef given as a string", () => {
    const file = fixture(
      "security-schemes.yaml",
      [
        "components:",
        "  securitySchemes:",
        "    bearerAuth:",
        "      type: http",
        "      scheme: bearer",
      ].join("\n"),
    )
    const root: any = { openapi: "3.1.0", components: { schemas: {} } }
    const report = merge(root, file)
    expect(report).not.toHaveBeenCalled()
    expect(root.components.securitySchemes.bearerAuth.scheme).toBe("bearer")
  })

  it("is a no-op guard for an override with no paths and no $ref", () => {
    const file = fixture(
      "security-schemes.yaml",
      [
        "components:",
        "  securitySchemes:",
        "    bearerAuth:",
        "      type: http",
      ].join("\n"),
    )
    // The root-level decorator applies this to every spec, including specs with no paths at all.
    const root: any = { openapi: "3.1.0" }
    const report = merge(root, file)
    expect(report).not.toHaveBeenCalled()
    expect(root.components.securitySchemes.bearerAuth.type).toBe("http")
  })

  it("merges a list of files in order, last write winning", () => {
    const first = fixture(
      "first.yaml",
      [
        "components:",
        "  schemas:",
        "    Shared:",
        "      title: from-first",
        "      type: object",
      ].join("\n"),
    )
    const second = fixture(
      "second.yaml",
      [
        "components:",
        "  schemas:",
        "    Shared:",
        "      title: from-second",
      ].join("\n"),
    )
    const root: any = { openapi: "3.1.0", components: { schemas: {} } }
    const report = merge(root, [first, second])
    expect(report).not.toHaveBeenCalled()
    expect(root.components.schemas.Shared.title).toBe("from-second")
    expect(root.components.schemas.Shared.type).toBe("object")
  })

  it("lets a later file $ref a schema an earlier file added", () => {
    const union = fixture(
      "union.yaml",
      [
        "components:",
        "  schemas:",
        "    CartItemObject:",
        "      type: object",
      ].join("\n"),
    )
    const components = fixture(
      "components.yaml",
      [
        "components:",
        "  schemas:",
        "    CartItemsResponse:",
        "      type: object",
        "      properties:",
        "        data:",
        "          items:",
        "            $ref: '#/components/schemas/CartItemObject'",
      ].join("\n"),
    )
    const root: any = { openapi: "3.1.0", components: { schemas: {} } }
    const report = merge(root, [union, components])
    expect(report).not.toHaveBeenCalled()
    expect(root.components.schemas.CartItemObject).toBeDefined()
  })

  it("reports the file when an override names a path the spec does not have", () => {
    const file = fixture(
      "override.yaml",
      [
        "paths:",
        "  /v2/carts/{cartID}/gone:",
        "    get:",
        "      responses:",
        "        '200':",
        "          description: ok",
      ].join("\n"),
    )
    const report = merge(specWithOneOperation(), file)
    expect(report).toHaveBeenCalledTimes(1)
    expect(messageOf(report)).toContain("override.yaml")
    expect(messageOf(report)).toContain("/v2/carts/{cartID}/gone")
  })

  it("reports the file when an override names a method the spec does not have", () => {
    const file = fixture(
      "override.yaml",
      [
        "paths:",
        "  /v2/carts/{cartID}/items:",
        "    post:",
        "      responses:",
        "        '201':",
        "          description: created",
      ].join("\n"),
    )
    const report = merge(specWithOneOperation(), file)
    expect(report).toHaveBeenCalledTimes(1)
    expect(messageOf(report)).toContain("override.yaml")
    expect(messageOf(report)).toContain("post /v2/carts/{cartID}/items")
  })

  it("reports the file when an override names a response the spec does not have", () => {
    const file = fixture(
      "override.yaml",
      [
        "paths:",
        "  /v2/carts/{cartID}/items:",
        "    get:",
        "      responses:",
        "        '404':",
        "          description: gone",
      ].join("\n"),
    )
    const report = merge(specWithOneOperation(), file)
    expect(report).toHaveBeenCalledTimes(1)
    expect(messageOf(report)).toContain("override.yaml")
    expect(messageOf(report)).toContain("response 404")
  })

  it("reports a dangling $ref", () => {
    const file = fixture(
      "override.yaml",
      [
        "paths:",
        "  /v2/carts/{cartID}/items:",
        "    get:",
        "      responses:",
        "        '200':",
        "          content:",
        "            application/json:",
        "              schema:",
        "                $ref: '#/components/schemas/NeverDefined'",
      ].join("\n"),
    )
    const report = merge(specWithOneOperation(), file)
    expect(report).toHaveBeenCalledTimes(1)
    expect(messageOf(report)).toContain("#/components/schemas/NeverDefined")
  })

  it("accepts a $ref the same file defines", () => {
    const file = fixture(
      "override.yaml",
      [
        "paths:",
        "  /v2/carts/{cartID}/items:",
        "    get:",
        "      responses:",
        "        '200':",
        "          content:",
        "            application/json:",
        "              schema:",
        "                $ref: '#/components/schemas/Added'",
        "components:",
        "  schemas:",
        "    Added:",
        "      type: object",
      ].join("\n"),
    )
    const root = specWithOneOperation()
    const report = merge(root, file)
    expect(report).not.toHaveBeenCalled()
    expect(
      (root.paths["/v2/carts/{cartID}/items"].get.responses["200"] as any)
        .content["application/json"].schema.$ref,
    ).toBe("#/components/schemas/Added")
  })

  it("does not treat non-method path item keys as operations", () => {
    const file = fixture(
      "override.yaml",
      [
        "paths:",
        "  /v2/carts/{cartID}/items:",
        "    summary: Cart items",
        "    parameters:",
        "      - name: cartID",
        "        in: path",
      ].join("\n"),
    )
    const root = specWithOneOperation()
    const report = merge(root, file)
    expect(report).not.toHaveBeenCalled()
    expect((root.paths["/v2/carts/{cartID}/items"] as any).summary).toBe(
      "Cart items",
    )
  })

  it("reports a folder passed as mergeRef", () => {
    const report = merge({ openapi: "3.1.0" }, dir)
    expect(messageOf(report)).toContain("Expected a file but received a folder")
  })

  it("does nothing when mergeRef is absent", () => {
    const root: any = { openapi: "3.1.0" }
    const report = vi.fn()
    ComponentMerge({}).Root.leave(root, {
      report,
      location: { key: () => "root" },
    })
    expect(report).not.toHaveBeenCalled()
    expect(root).toEqual({ openapi: "3.1.0" })
  })
})
