import { describe, test, expect } from "vitest";
import { getFamilyVariations } from "./product-family";

describe("getFamilyVariations", () => {
  test("returns the parent product's variations and their options", () => {
    const hit = {
      id: "parent-1",
      meta: {
        product_types: ["parent"],
        variations: [
          {
            id: "colour",
            name: "Colour",
            options: [
              { id: "red", name: "Red" },
              { id: "blue", name: "Blue" },
            ],
          },
          {
            id: "size",
            name: "Size",
            options: [{ id: "small", name: "Small" }],
          },
        ],
      },
    };

    expect(getFamilyVariations(hit)).toEqual([
      {
        id: "colour",
        name: "Colour",
        options: [
          { id: "red", name: "Red" },
          { id: "blue", name: "Blue" },
        ],
      },
      {
        id: "size",
        name: "Size",
        options: [{ id: "small", name: "Small" }],
      },
    ]);
  });

  test("returns every option the family offers, however many there are", () => {
    const options = Array.from({ length: 9 }, (_, index) => ({
      id: `colour-${index}`,
      name: `Colour ${index}`,
    }));

    expect(
      getFamilyVariations({
        meta: { variations: [{ id: "colour", name: "Colour", options }] },
      })[0]!.options,
    ).toHaveLength(9);
  });

  test("returns nothing for a product with no variations", () => {
    expect(
      getFamilyVariations({
        id: "standard-1",
        meta: { product_types: ["standard"] },
      }),
    ).toEqual([]);
  });

  test("returns nothing when the hit has no meta at all", () => {
    expect(getFamilyVariations({ id: "standard-1" })).toEqual([]);
    expect(getFamilyVariations(undefined)).toEqual([]);
    expect(getFamilyVariations(null)).toEqual([]);
  });

  test("honours sort_order on variations and options", () => {
    const hit = {
      meta: {
        variations: [
          {
            id: "size",
            name: "Size",
            sort_order: 2,
            options: [
              { id: "large", name: "lg", sort_order: 2 },
              { id: "small", name: "sm", sort_order: 0 },
              { id: "medium", name: "md", sort_order: 1 },
            ],
          },
          {
            id: "colour",
            name: "Colour",
            sort_order: 1,
            options: [{ id: "red", name: "Red" }],
          },
        ],
      },
    };

    expect(getFamilyVariations(hit).map((variation) => variation.name)).toEqual([
      "Colour",
      "Size",
    ]);
    expect(
      getFamilyVariations(hit)[1]!.options.map((option) => option.name),
    ).toEqual(["sm", "md", "lg"]);
  });

  test("keeps the index order of entries without a sort_order, after those with one", () => {
    const hit = {
      meta: {
        variations: [
          { id: "a", name: "A", options: [{ id: "a1", name: "A1" }] },
          { id: "b", name: "B", options: [{ id: "b1", name: "B1" }] },
          {
            id: "c",
            name: "C",
            sort_order: 1,
            options: [{ id: "c1", name: "C1" }],
          },
        ],
      },
    };

    expect(getFamilyVariations(hit).map((variation) => variation.name)).toEqual([
      "C",
      "A",
      "B",
    ]);
  });

  test("falls back to the name when the index gives an entry no id", () => {
    expect(
      getFamilyVariations({
        meta: {
          variations: [{ name: "Size", options: [{ name: "Small" }] }],
        },
      }),
    ).toEqual([
      { id: "Size", name: "Size", options: [{ id: "Small", name: "Small" }] },
    ]);
  });

  test("drops entries the card would have no label for", () => {
    const hit = {
      meta: {
        variations: [
          { id: "colour", options: [{ id: "red", name: "Red" }] },
          { id: "empty", name: "Empty", options: [] },
          { id: "missing-options", name: "Missing options" },
          {
            id: "fit",
            name: "Fit",
            options: [
              { id: "slim", name: "Slim" },
              { id: "regular" },
            ],
          },
        ],
      },
    };

    expect(getFamilyVariations(hit)).toEqual([
      { id: "fit", name: "Fit", options: [{ id: "slim", name: "Slim" }] },
    ]);
  });

  test("ignores a variations field that is not an array", () => {
    expect(getFamilyVariations({ meta: { variations: "Colour" } })).toEqual([]);
    expect(getFamilyVariations({ meta: { variations: {} } })).toEqual([]);
  });
});
