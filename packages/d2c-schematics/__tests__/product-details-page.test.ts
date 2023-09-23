import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"

import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"

describe("Product Details Page Schematic", () => {
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

  const defaultOptions = {}

  let initTree: UnitTestTree
  beforeEach(async () => {
    /**
     * Product Details Page schematic depends on workspace and application schematics
     */
    const workspaceTree = await schematicRunner
      .runSchematicAsync("workspace", workspaceOptions)
      .toPromise()
    initTree = await schematicRunner
      .runSchematicAsync("application", applicationOptions, workspaceTree)
      .toPromise()
  })

  it("should create product detail component files", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("product-details-page", options, initTree)
      .toPromise()
    const files = tree.files
    // console.log("files: ", JSON.stringify(files))
    expect(files).toIncludeAllPartialMembers([
      "/src/components/product/ChildProduct.tsx",
      "/src/components/product/BaseProduct.tsx",
      "/src/components/product/SimpleProduct.tsx",
      "/src/components/product/Price.tsx",
      "/src/components/product/StrikePrice.tsx",
      "/src/components/product/ProductSummary.tsx",
      "/src/components/product/ProductExtensions.tsx",
      "/src/components/product/ProductDetails.tsx",
      "/src/components/product/ProductContainer.tsx",
      "/src/components/product/carousel/ProductCarousel.tsx",
      "/src/components/product/carousel/ProductCarousel.module.css",
      "/src/components/product/carousel/ProductHighlightCarousel.tsx",
      "/src/components/product/carousel/CarouselListener.tsx",
      "/src/components/product/carousel/HorizontalCarousel.tsx",
      "/src/components/product/CartActions.tsx",
      "/src/components/product/ProductComponents.tsx",
      "/src/components/product/ProductVariations.tsx",
      "/src/components/product/variations/ProductVariationColor.tsx",
      "/src/components/product/variations/ProductVariationStandard.tsx",
    ])
  })

  it("should create product detail utility files", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("product-details-page", options, initTree)
      .toPromise()
    const files = tree.files
    // console.log("files: ", JSON.stringify(files))
    expect(files).toIncludeAllPartialMembers([
      "/src/pages/products/[productId].tsx",
      "/src/lib/types/matrix-object-entry.ts",
      "/src/lib/types/product-types.ts",
      "/src/lib/product-util.ts",
      "/src/lib/product-helper.ts",
      "/src/lib/color-lookup.ts",
      "/src/lib/sort-alphabetically.ts",
      "/src/lib/retrieve-product-props.ts",
    ])
  })

  it("should create product detail page files", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("product-details-page", options, initTree)
      .toPromise()
    const files = tree.files
    expect(files).toIncludeAllPartialMembers([
      "/src/pages/products/[productId].tsx",
    ])
  })

  it("should have files provided by application schematic", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("product-details-page", options, initTree)
      .toPromise()
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
