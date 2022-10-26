import {
  SchematicTestRunner,
  UnitTestTree
} from "@angular-devkit/schematics/testing"

import { Schema as WorkspaceOptions } from "../workspace/schema"

describe("Cart Schematic", () => {
  const schematicRunner = new SchematicTestRunner(
    "@schematics/angular",
    require.resolve("../collection.json")
  )

  const workspaceOptions: WorkspaceOptions = {
    name: "workspace",
    epccClientId: "123",
    epccClientSecret: "456",
    epccEndpointUrl: "api.moltin.com"
  }

  const defaultOptions = {}

  let workspaceTree: UnitTestTree
  beforeEach(async () => {
    workspaceTree = await schematicRunner
      .runSchematicAsync("workspace", workspaceOptions)
      .toPromise()
  })

  it("should create cart page files of an application", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("cart", options, workspaceTree)
      .toPromise()
    const files = tree.files

    expect(files).toIncludeAllPartialMembers([
      "/src/pages/cart.tsx",
      "/src/lib/store-wrapper-ssr.ts",
      "/src/lib/build-site-navigation.ts",
      "/src/services/hierarchy.ts",
      "/src/services/cart.ts",
      "/src/lib/epcc-implicit-client.ts",
      "/src/lib/custom-rule-headers.ts",
      "/src/lib/ep-client-store.ts",
      "/src/lib/resolve-cart-env.ts",
      "/src/lib/cart-cookie.ts",
      "/src/lib/types/store-context.ts"
    ])
  })
})
