import { describe, expect, test } from "vitest"
import {
  resolveTaxonomyFacetField,
  taxonomyFacetLabel,
} from "./search-taxonomy-facet"

describe("resolveTaxonomyFacetField", () => {
  test("is undefined when the variable is unset or blank, which hides the facet", () => {
    expect(resolveTaxonomyFacetField(undefined)).toBeUndefined()
    expect(resolveTaxonomyFacetField("   ")).toBeUndefined()
  })

  test("trims the configured field name", () => {
    expect(resolveTaxonomyFacetField(" shopper_attributes.range ")).toBe(
      "shopper_attributes.range",
    )
  })
})

describe("taxonomyFacetLabel", () => {
  test.each([
    ["shopper_attributes.range", "Range"],
    ["shopper_attributes.product_line", "Product line"],
    ["extensions.products(general).product-line", "Product line"],
  ])("labels %s as %s", (field, label) => {
    expect(taxonomyFacetLabel(field)).toBe(label)
  })
})
