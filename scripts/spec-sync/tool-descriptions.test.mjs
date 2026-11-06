import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  bundledSpecOf,
  operationsWithoutDescription,
  toolsWithoutDescription,
} from "./tool-descriptions.mjs"

const bundle = `openapi: 3.1.0
info:
  title: Roles
paths:
  /v2/permissions/custom-user-roles:
    parameters:
      - $ref: '#/components/parameters/Filter'
    get:
      summary: List Custom User Roles
      operationId: ListCustomUserRoles
      description: |
        Retrieves a list of Custom User Roles

        operationId: notThisOne
      responses:
        '200':
          description: OK
    post:
      operationId: CreateACustomUserRole
      x-mcp-risk: write
      x-mcp-description: >-
        Creates a custom user role with an access level for each
        permission group.
      responses:
        '201':
          description: Created
  /v2/permissions/custom-user-roles/{id}:
    delete:
      operationId: 'DeleteACustomUserRole'
      responses:
        '204':
          description: No Content
      x-mcp-description: Deletes one custom user role by its ID.
    put:
      operationId: UpdateACustomUserRole
      responses:
        '200':
          description: OK
components:
  schemas:
    Role:
      type: object
      properties:
        operationId:
          type: string
`

describe("operationsWithoutDescription", () => {
  it("names the operations that carry no x-mcp-description, in spec order", () => {
    assert.deepEqual(operationsWithoutDescription(bundle), [
      "ListCustomUserRoles",
      "UpdateACustomUserRole",
    ])
  })

  it("is empty when every operation is described", () => {
    const described = bundle.replace(
      /operationId: (ListCustomUserRoles|UpdateACustomUserRole)\n/g,
      "operationId: $1\n      x-mcp-description: Written.\n",
    )
    assert.deepEqual(operationsWithoutDescription(described), [])
  })

  it("ignores a spec with no paths", () => {
    assert.deepEqual(
      operationsWithoutDescription(
        "openapi: 3.1.0\ncomponents:\n  schemas: {}\n",
      ),
      [],
    )
  })
})

describe("bundledSpecOf", () => {
  const repo = () => {
    const root = mkdtempSync(join(tmpdir(), "tool-descriptions-"))
    const pkg = (name, config) => {
      mkdirSync(join(root, "packages/sdks", name), { recursive: true })
      if (config !== undefined)
        writeFileSync(
          join(root, "packages/sdks", name, "openapi-ts.config.ts"),
          config,
        )
    }
    return { root, pkg }
  }

  it("resolves the input of a package whose config enables the mcp plugin", () => {
    const { root, pkg } = repo()
    pkg(
      "roles",
      `export default {\n  input: "../specs/bundled/roles_standalone.yaml",\n  plugins: [mcp()],\n}\n`,
    )
    assert.equal(
      bundledSpecOf("roles", root),
      join(root, "packages/sdks/specs/bundled/roles_standalone.yaml"),
    )
  })

  it("is null for a package without the mcp plugin, or without a config", () => {
    const { root, pkg } = repo()
    pkg(
      "plain",
      `export default {\n  input: "../specs/plain.yaml",\n  plugins: [],\n}\n`,
    )
    pkg("bare")
    assert.equal(bundledSpecOf("plain", root), null)
    assert.equal(bundledSpecOf("bare", root), null)
  })

  it("reports the package of each undescribed tool, and skips packages with no MCP server", () => {
    const { root, pkg } = repo()
    pkg(
      "roles",
      `export default {\n  input: "../specs/bundled/roles.yaml",\n  plugins: [mcp()],\n}\n`,
    )
    pkg("plain", `export default {\n  input: "../specs/plain.yaml",\n}\n`)
    mkdirSync(join(root, "packages/sdks/specs/bundled"), { recursive: true })
    writeFileSync(join(root, "packages/sdks/specs/bundled/roles.yaml"), bundle)
    assert.deepEqual(toolsWithoutDescription(["plain", "roles"], root), [
      { package: "roles", operationId: "ListCustomUserRoles" },
      { package: "roles", operationId: "UpdateACustomUserRole" },
    ])
  })

  it("refuses a package whose bundle has not been built", () => {
    const { root, pkg } = repo()
    pkg(
      "roles",
      `export default {\n  input: "../specs/bundled/roles.yaml",\n  plugins: [mcp()],\n}\n`,
    )
    assert.throws(
      () => toolsWithoutDescription(["roles"], root),
      /build the package first/,
    )
  })
})
