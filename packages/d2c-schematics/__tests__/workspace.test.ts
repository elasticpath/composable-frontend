import { SchematicTestRunner } from "@angular-devkit/schematics/testing"
import path from "path"
import { Schema as WorkspaceOptions } from "../workspace/schema"
import { parse as parseJson } from "jsonc-parser"

const collectionPath = path.join(__dirname, "../collection.json")

describe("Workspace Schematic", () => {
  const schematicRunner = new SchematicTestRunner("schematics", collectionPath)
  const defaultOptions: WorkspaceOptions = {
    name: "foo",
    epccClientId: "123",
    epccClientSecret: "456",
    epccEndpointUrl: "euwest.api.elasticpath.com",
  }

  it("workspace schematic should create files for workspace", async () => {
    const options = { ...defaultOptions }

    try {
      const tree: any = await schematicRunner
        .runSchematicAsync("workspace", options)
        .toPromise()
      const files = tree.files
      expect(files.sort()).toMatchSnapshot()
    } catch (err) {
      throw new Error(err)
    }
  })

  it("workspace schematic should not configure testing when tests=false", async () => {
    const tree = await schematicRunner.runSchematic("workspace", {
      ...defaultOptions,
      tests: false,
    })

    const { scripts, devDependencies } = parseJson(
      tree.readContent("package.json").toString(),
    )
    expect(scripts).not.toContainKeys(["test", "test:watch"])
    expect(devDependencies).not.toContainKeys([
      "jest",
      "@testing-library/jest-dom",
      "@testing-library/react",
    ])
    const files = tree.files
    expect(files).not.toIncludeAnyMembers([
      "playwright.config.ts.template",
      ".env.test.template",
      "jest.config.ts.template",
    ])
  })
})
