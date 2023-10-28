import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"

import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"

describe("Cart Schematic", () => {
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
     * Cart schematic depends on workspace and application schematics
     */
    const workspaceTree = await schematicRunner
      .runSchematicAsync("workspace", workspaceOptions)
      .toPromise()
    initTree = await schematicRunner
      .runSchematicAsync("application", applicationOptions, workspaceTree)
      .toPromise()
  })

  it("should create cart page files of an application", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("cart", options, initTree)
      .toPromise()
    const files = tree.files

    expect(files).toIncludeAllPartialMembers([
      "/src/lib/build-site-navigation.ts",
      "/src/services/hierarchy.ts",
      "/src/services/cart.ts",
      "/src/lib/epcc-implicit-client.ts",
      "/src/lib/custom-rule-headers.ts",
      "/src/lib/ep-client-store.ts",
      "/src/lib/resolve-cart-env.ts",
      "/src/lib/types/store-context.ts",
      "/src/lib/resolve-shopping-cart-props.ts",
      "/src/components/cart/Cart.tsx",
      "/src/components/cart/CartItemList.tsx",
      "/src/components/cart/CartOrderSummary.tsx",
      "/src/components/cart/Promotion.tsx",
      "/src/components/quantity-handler/QuantityHandler.tsx",
    ])
  })
})
