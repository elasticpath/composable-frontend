import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"

import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"

describe("Components Schematic", () => {
  const schematicRunner = new SchematicTestRunner(
    "@schematics/angular",
    require.resolve("../collection.json")
  )

  const workspaceOptions: WorkspaceOptions = {
    name: "workspace",
    epccClientId: "123",
    epccClientSecret: "456",
    epccEndpointUrl: "api.moltin.com",
  }

  const applicationOptions: ApplicationOptions = {
    name: "foo",
  }

  const defaultOptions = {}

  let initTree: UnitTestTree
  beforeEach(async () => {
    /**
     * Components schematic depends on workspace and application schematics
     */
    const workspaceTree = await schematicRunner
      .runSchematicAsync("workspace", workspaceOptions)
      .toPromise()
    initTree = await schematicRunner
      .runSchematicAsync("application", applicationOptions, workspaceTree)
      .toPromise()
  })

  it("component schematic should only create specified component files", async () => {
    const options = { ...defaultOptions, components: ["PromotionBanner"] }
    const tree = await schematicRunner
      .runSchematicAsync("components", options, initTree)
      .toPromise()
    const files = tree.files

    expect(files).not.toIncludeAnyMembers([
      "/src/components/featured-products/FeaturedProducts.tsx",
      "/src/components/featured-products/fetchFeaturedProducts.ts",
    ])

    expect(files).toIncludeAnyMembers([
      "/src/components/promotion-banner/PromotionBanner.tsx",
      "/src/components/promotion-banner/fetchFeaturedPromotion.ts",
      "/src/services/promotion.ts",
    ])
  })

  it("component schematic should create FeaturedProducts files", async () => {
    const options = { ...defaultOptions, components: ["FeaturedProducts"] }
    const tree = await schematicRunner
      .runSchematicAsync("components", options, initTree)
      .toPromise()
    const files = tree.files

    expect(files).toIncludeAnyMembers([
      "/src/components/featured-products/FeaturedProducts.tsx",
      "/src/components/featured-products/fetchFeaturedProducts.ts",
    ])
  })

  it("component schematic should create PromotionBanner files", async () => {
    const options = { ...defaultOptions, components: ["PromotionBanner"] }
    const tree = await schematicRunner
      .runSchematicAsync("components", options, initTree)
      .toPromise()
    const files = tree.files

    expect(files).toIncludeAnyMembers([
      "/src/components/promotion-banner/PromotionBanner.tsx",
      "/src/components/promotion-banner/fetchFeaturedPromotion.ts",
      "/src/services/promotion.ts",
    ])
  })
})
