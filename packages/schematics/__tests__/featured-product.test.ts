import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"

import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"
import { Schema as FeaturedProductOptions } from "../featured-products/schema"
import { parseEnv } from "../utility/add-env-variable"
import { FEATURED_PRODUCTS_ENV_KEY } from "../featured-products"

describe("Featured Products Schematic", () => {
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

  const defaultOptions: FeaturedProductOptions = {
    "featured-node-id": "123",
  }

  let initTree: UnitTestTree
  beforeEach(async () => {
    /**
     * Featured Products schematic depends on workspace and application schematics
     */
    const workspaceTree = await schematicRunner
      .runSchematicAsync("workspace", workspaceOptions)
      .toPromise()
    initTree = await schematicRunner
      .runSchematicAsync("application", applicationOptions, workspaceTree)
      .toPromise()
  })

  it("featured products schematic should create component files", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("featured-products", options, initTree)
      .toPromise()
    const files = tree.files

    expect(files).toIncludeAnyMembers([
      "/src/components/featured-products/FeaturedProducts.tsx",
      "/src/components/featured-products/fetchFeaturedProducts.ts",
    ])
  })

  it("featured products schematic should update .env.local", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("featured-products", options, initTree)
      .toPromise()

    const rawText = tree.readText("/.env.local")
    const parsed = parseEnv(rawText)

    expect(parsed[FEATURED_PRODUCTS_ENV_KEY]).toEqual("123")
  })
})
