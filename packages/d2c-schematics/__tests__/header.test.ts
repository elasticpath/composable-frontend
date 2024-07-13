import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"

import { createSourceFile, ScriptTarget } from "typescript"

import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"

describe("Header Schematic", () => {
  const schematicRunner = new SchematicTestRunner(
    "@schematics/angular",
    require.resolve("../collection.json"),
  )

  const workspaceOptions: WorkspaceOptions = {
    name: "workspace",
    epccClientId: "123",
    epccClientSecret: "456",
    epccEndpointUrl: "euwest.api.elasticpath.com",
  }

  const applicationOptions: ApplicationOptions = {
    name: "foo",
  }

  const defaultOptions = {}

  let initTree: UnitTestTree
  beforeEach(async () => {
    /**
     * Header schematic depends on workspace and application schematics
     */
    const workspaceTree = await schematicRunner.runSchematic(
      "workspace",
      workspaceOptions,
    )

    initTree = await schematicRunner.runSchematic(
      "application",
      applicationOptions,
      workspaceTree,
    )
  })

  it("should create header component files of an application", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner.runSchematic("header", options, initTree)

    const files = tree.files

    expect(files).toMatchSnapshot()
  })

  it("header schematic should not import search modal module when search=false", async () => {
    const tree = await schematicRunner.runSchematic("header", {
      ...defaultOptions,
      search: false,
    })

    const tsSrcFile = createSourceFile(
      "Header.tsx",
      tree.readContent("/src/components/header/Header.tsx"),
      ScriptTarget.Latest,
    )

    // @ts-ignore
    const identifiers = tsSrcFile.identifiers as Map<string, string>

    expect(identifiers.has("SearchModal")).toEqual(false)
  })
})
