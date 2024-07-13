import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"

import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"

describe("Footer Schematic", () => {
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
     * Footer schematic depends on workspace and application schematics
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

  it("should create footer component files of an application", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner.runSchematic("footer", options, initTree)

    const files = tree.files

    expect(files).toIncludeAllPartialMembers([
      "/src/components/footer/Footer.tsx",
    ])
  })
})
