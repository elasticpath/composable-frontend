import { describe, test, expect } from "vitest";
import { resolveCardState } from "./resolve-card-state";
import type { FamilyVariation } from "./product-family";

const size: FamilyVariation = {
  id: "size",
  name: "Size",
  options: [
    { id: "sm", name: "sm" },
    { id: "md", name: "md" },
  ],
};
const colour: FamilyVariation = {
  id: "colour",
  name: "Colour",
  options: [
    { id: "red", name: "Red" },
    { id: "blue", name: "Blue" },
  ],
};

const flatMatrix = { sm: "child-sm", md: "child-md" };
const nestedMatrix = {
  sm: { red: "sm-red", blue: "sm-blue" },
  md: { red: "md-red", blue: "md-blue" },
};

const priced = (id: string, amount: number, formatted: string) => ({
  id,
  amount,
  formattedPrice: formatted,
  currency: "USD",
  slug: id,
});

describe("resolveCardState", () => {
  describe("before the shopper chooses", () => {
    test("quotes an exact price when every variant matches", () => {
      const state = resolveCardState({
        variations: [size],
        matrix: flatMatrix,
        variants: {
          "child-sm": priced("child-sm", 2000, "$20.00"),
          "child-md": priced("child-md", 2000, "$20.00"),
        },
        selectedOptionIds: [undefined],
        currency: "USD",
      });
      expect(state.price).toEqual({ formatted: "$20.00", isFrom: false });
      expect(state.selectedVariant).toBeUndefined();
    });

    test("quotes a from price when the variants differ", () => {
      const state = resolveCardState({
        variations: [size],
        matrix: flatMatrix,
        variants: {
          "child-sm": priced("child-sm", 2000, "$20.00"),
          "child-md": priced("child-md", 1000, "$10.00"),
        },
        selectedOptionIds: [undefined],
        currency: "USD",
      });
      expect(state.price).toEqual({ formatted: "$10.00", isFrom: true });
    });

    test("quotes a from price when a variant has no price of its own", () => {
      const state = resolveCardState({
        variations: [size],
        matrix: flatMatrix,
        variants: {
          "child-sm": priced("child-sm", 2000, "$20.00"),
          "child-md": { id: "child-md" },
        },
        selectedOptionIds: [undefined],
        currency: "USD",
      });
      expect(state.price).toEqual({ formatted: "$20.00", isFrom: true });
    });

    test("shows the first option's variant, so the card has a picture", () => {
      const state = resolveCardState({
        variations: [size],
        matrix: flatMatrix,
        variants: {
          "child-sm": priced("child-sm", 2000, "$20.00"),
          "child-md": priced("child-md", 1000, "$10.00"),
        },
        selectedOptionIds: [undefined],
        currency: "USD",
      });
      expect(state.representativeVariant?.id).toBe("child-sm");
    });
  });

  describe("once the shopper chooses", () => {
    test("quotes that variant exactly", () => {
      const state = resolveCardState({
        variations: [size],
        matrix: flatMatrix,
        variants: {
          "child-sm": priced("child-sm", 2000, "$20.00"),
          "child-md": priced("child-md", 1000, "$10.00"),
        },
        selectedOptionIds: ["md"],
        currency: "USD",
      });
      expect(state.price).toEqual({ formatted: "$10.00", isFrom: false });
      expect(state.selectedVariant?.id).toBe("child-md");
    });

    test("shows no price when the chosen variant has none", () => {
      // Falling back to the family price here would quote a number the shopper
      // cannot buy the thing they just chose at.
      const state = resolveCardState({
        variations: [size],
        matrix: flatMatrix,
        variants: {
          "child-sm": priced("child-sm", 2000, "$20.00"),
          "child-md": { id: "child-md" },
        },
        selectedOptionIds: ["md"],
        currency: "USD",
      });
      expect(state.price).toBeUndefined();
      expect(state.selectedVariant?.id).toBe("child-md");
    });

    test("shows no price when the chosen variant is not in the lookup yet", () => {
      const state = resolveCardState({
        variations: [size],
        matrix: flatMatrix,
        variants: { "child-sm": priced("child-sm", 2000, "$20.00") },
        selectedOptionIds: ["md"],
        currency: "USD",
      });
      expect(state.price).toBeUndefined();
      expect(state.selectedVariant).toBeUndefined();
    });

    test("keeps quoting the family until every variation has an option", () => {
      const state = resolveCardState({
        variations: [size, colour],
        matrix: nestedMatrix,
        variants: {
          "sm-red": priced("sm-red", 1000, "$10.00"),
          "sm-blue": priced("sm-blue", 2000, "$20.00"),
          "md-red": priced("md-red", 2000, "$20.00"),
          "md-blue": priced("md-blue", 2000, "$20.00"),
        },
        selectedOptionIds: ["sm", undefined],
        currency: "USD",
      });
      expect(state.price).toEqual({ formatted: "$10.00", isFrom: true });
      expect(state.selectedVariant).toBeUndefined();
    });

    test("resolves a variant across two variations", () => {
      const state = resolveCardState({
        variations: [size, colour],
        matrix: nestedMatrix,
        variants: { "md-blue": priced("md-blue", 4200, "$42.00") },
        selectedOptionIds: ["md", "blue"],
        currency: "USD",
      });
      expect(state.selectedVariant?.id).toBe("md-blue");
      expect(state.price).toEqual({ formatted: "$42.00", isFrom: false });
    });
  });

  test("has no price for a product that is not a family", () => {
    const state = resolveCardState({
      variations: [],
      matrix: undefined,
      variants: {},
      selectedOptionIds: [],
      currency: "USD",
    });
    expect(state).toEqual({});
  });

  test("ignores variants priced in another currency", () => {
    const state = resolveCardState({
      variations: [size],
      matrix: flatMatrix,
      variants: {
        "child-sm": { id: "child-sm", amount: 100, formattedPrice: "£1.00", currency: "GBP" },
        "child-md": priced("child-md", 2000, "$20.00"),
      },
      selectedOptionIds: [undefined],
      currency: "USD",
    });
    expect(state.price).toEqual({ formatted: "$20.00", isFrom: true });
  });
});
