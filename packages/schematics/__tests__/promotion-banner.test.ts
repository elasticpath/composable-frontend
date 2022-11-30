import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"

import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"
import { Schema as PromotionBannerOptions } from "../promotion-banner/schema"
import { parseEnv } from "../utility/add-env-variable"
import { PROMO_ENV_KEY } from "../promotion-banner"

describe("Promotion Banner Schematic", () => {
  const schematicRunner = new SchematicTestRunner(
    "@schematics/angular",
    require.resolve("../collection.json")
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

  const defaultOptions: PromotionBannerOptions = {
    "promotion-id": "123",
  }

  let initTree: UnitTestTree
  beforeEach(async () => {
    /**
     * Promotion Banner schematic depends on workspace and application schematics
     */
    const workspaceTree = await schematicRunner
      .runSchematicAsync("workspace", workspaceOptions)
      .toPromise()
    initTree = await schematicRunner
      .runSchematicAsync("application", applicationOptions, workspaceTree)
      .toPromise()
  })

  it("promotion banner schematic should create component files", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("promotion-banner", options, initTree)
      .toPromise()
    const files = tree.files

    expect(files).toIncludeAnyMembers([
      "/src/components/promotion-banner/PromotionBanner.tsx",
      "/src/components/promotion-banner/fetchFeaturedPromotion.ts",
      "/src/services/promotion.ts",
    ])
  })

  it("promotion banner schematic should update .env.local", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("promotion-banner", options, initTree)
      .toPromise()

    const rawText = tree.readText("/.env.local")
    const parsed = parseEnv(rawText)

    expect(parsed[PROMO_ENV_KEY]).toEqual("123")
  })
})
