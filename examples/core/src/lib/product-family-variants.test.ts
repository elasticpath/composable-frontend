import { describe, test, expect } from "vitest";
import {
  collectVariantProductIds,
  getDefaultSelection,
  getVariationMatrix,
} from "./product-family";

const flatHit = {
  meta: {
    variations: [
      {
        id: "size",
        name: "Size",
        options: [
          { id: "sm", name: "sm", sort_order: 0 },
          { id: "md", name: "md", sort_order: 1 },
        ],
      },
    ],
    variation_matrix: { sm: "child-sm", md: "child-md" },
  },
};

const nestedHit = {
  meta: {
    variations: [
      {
        id: "size",
        name: "Size",
        options: [
          { id: "sm", name: "sm", sort_order: 0 },
          { id: "lg", name: "lg", sort_order: 1 },
        ],
      },
      {
        id: "colour",
        name: "Colour",
        options: [
          { id: "red", name: "Red", sort_order: 0 },
          { id: "blue", name: "Blue", sort_order: 1 },
        ],
      },
    ],
    variation_matrix: {
      sm: { red: "child-sm-red", blue: "child-sm-blue" },
      lg: { red: "child-lg-red", blue: "child-lg-blue" },
    },
  },
};

describe("getVariationMatrix", () => {
  test("returns the parent's matrix", () => {
    expect(getVariationMatrix(flatHit)).toEqual({
      sm: "child-sm",
      md: "child-md",
    });
  });

  test("returns undefined when the hit has no matrix", () => {
    expect(getVariationMatrix({ meta: {} })).toBeUndefined();
    expect(getVariationMatrix(undefined)).toBeUndefined();
    expect(getVariationMatrix({ meta: { variation_matrix: "nope" } })).toBeUndefined();
  });
});

describe("collectVariantProductIds", () => {
  test("collects the child ids a flat matrix points at", () => {
    expect(collectVariantProductIds([flatHit])).toEqual(["child-sm", "child-md"]);
  });

  test("collects child ids from a nested matrix", () => {
    expect(collectVariantProductIds([nestedHit]).sort()).toEqual([
      "child-lg-blue",
      "child-lg-red",
      "child-sm-blue",
      "child-sm-red",
    ]);
  });

  test("gathers ids across every hit on the page, without duplicates", () => {
    const ids = collectVariantProductIds([flatHit, flatHit, nestedHit]);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
  });

  test("ignores hits that are not families", () => {
    expect(
      collectVariantProductIds([{ meta: { product_types: ["standard"] } }, undefined, null]),
    ).toEqual([]);
  });
});

describe("getDefaultSelection", () => {
  test("picks the first option of each variation, so a card always resolves a variant", () => {
    expect(getDefaultSelection([
      { id: "size", name: "Size", options: [{ id: "sm", name: "sm" }, { id: "md", name: "md" }] },
      { id: "colour", name: "Colour", options: [{ id: "red", name: "Red" }] },
    ])).toEqual(["sm", "red"]);
  });

  test("returns nothing for a product with no variations", () => {
    expect(getDefaultSelection([])).toEqual([]);
  });
});
