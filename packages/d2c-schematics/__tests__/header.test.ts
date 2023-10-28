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
    const workspaceTree = await schematicRunner
      .runSchematicAsync("workspace", workspaceOptions)
      .toPromise()
    initTree = await schematicRunner
      .runSchematicAsync("application", applicationOptions, workspaceTree)
      .toPromise()
  })

  it("should create header component files of an application", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("header", options, initTree)
      .toPromise()
    const files = tree.files

    expect(
      files.filter((f) => f.startsWith("/src/components/header/")).sort(),
    ).toEqual(
      [
        "/src/components/header/cart/CartMenu.tsx",
        "/src/components/header/cart/ModalCartItem.tsx",
        "/src/components/header/navigation/MobileNavBar.tsx",
        "/src/components/header/navigation/MobileNavBarButton.tsx",
        "/src/components/header/navigation/NavBarPopover.tsx",
        "/src/components/header/navigation/NavBar.tsx",
        "/src/components/header/navigation/NavItemContent.tsx",
        "/src/components/header/Header.tsx",
        "/src/components/header/navigation/NavMenu.tsx",
      ].sort(),
    )
  })

  it("header schematic should not import search modal module when search=false", async () => {
    const tree = await schematicRunner
      .runSchematicAsync("header", { ...defaultOptions, search: false })
      .toPromise()

    const tsSrcFile = createSourceFile(
      "Header.tsx",
      tree.readContent("/src/components/header/Header.tsx"),
      ScriptTarget.Latest,
    )

    // @ts-ignore
    const identifiers = tsSrcFile.identifiers as Map<string, string>

    expect(identifiers.has("SearchModal")).toEqual(false)
  })

  it("header schematic should import search modal module when search=true", async () => {
    const tree = await schematicRunner
      .runSchematicAsync("header", { ...defaultOptions, search: true })
      .toPromise()

    const tsSrcFile = createSourceFile(
      "Header.tsx",
      tree.readContent("/src/components/header/Header.tsx"),
      ScriptTarget.Latest,
    )

    // @ts-ignore
    const identifiers = tsSrcFile.identifiers as Map<string, string>

    expect(identifiers.has("SearchModal")).toEqual(true)
  })
})
