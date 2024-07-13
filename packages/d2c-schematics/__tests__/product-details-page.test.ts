import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"

import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"

describe("Product Details Page Schematic", () => {
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
     * Product Details Page schematic depends on workspace and application schematics
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

  it("should create product detail component files", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner.runSchematic(
      "product-details-page",
      options,
      initTree,
    )

    const files = tree.files
    // console.log("files: ", JSON.stringify(files))
    expect(files).toMatchSnapshot()
  })

  it("should have files provided by application schematic", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner.runSchematic(
      "product-details-page",
      options,
      initTree,
    )

    const files = tree.files

    expect(files).toIncludeAllPartialMembers([
      "/src/components/shimmer.tsx",
      "/src/lib/epcc-implicit-client.ts",
      "/src/lib/to-base-64.ts",
      "/src/lib/custom-rule-headers.ts",
      "/src/lib/is-empty-object.ts",
    ])
  })
})
