import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"

import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"
import { Schema as FeaturedProductOptions } from "../featured-products/schema"

describe("Featured Products Schematic", () => {
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

  const defaultOptions: FeaturedProductOptions = {}

  let initTree: UnitTestTree
  beforeEach(async () => {
    /**
     * Featured Products schematic depends on workspace and application schematics
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

  it("featured products schematic should create component files", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner.runSchematic(
      "featured-products",
      options,
      initTree,
    )

    const files = tree.files

    expect(files).toIncludeAnyMembers([
      "/src/components/featured-products/FeaturedProducts.tsx",
      "/src/components/featured-products/fetchFeaturedProducts.ts",
    ])
  })
})
