import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"

import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"
import { Schema as PromotionBannerOptions } from "../promotion-banner/schema"

describe("Promotion Banner Schematic", () => {
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

  const defaultOptions: PromotionBannerOptions = {}

  let initTree: UnitTestTree
  beforeEach(async () => {
    /**
     * Promotion Banner schematic depends on workspace and application schematics
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

  it("promotion banner schematic should create component files", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner.runSchematic(
      "promotion-banner",
      options,
      initTree,
    )

    const files = tree.files

    expect(files).toIncludeAnyMembers([
      "/src/components/promotion-banner/PromotionBanner.tsx",
      "/src/components/promotion-banner/fetchFeaturedPromotion.ts",
      "/src/services/promotion.ts",
    ])
  })
})
