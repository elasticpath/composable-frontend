import { describe, test, expect } from "vitest";
import { resolveFamilyPrice } from "./resolve-family-price";

describe("resolveFamilyPrice", () => {
  test("shows the single price when every variant costs the same", () => {
    expect(
      resolveFamilyPrice([
        { id: "a", amount: 2000, formattedPrice: "$20.00" },
        { id: "b", amount: 2000, formattedPrice: "$20.00" },
      ]),
    ).toBe("$20.00");
  });

  test("shows a from price when variants are priced differently", () => {
    expect(
      resolveFamilyPrice([
        { id: "a", amount: 246454, formattedPrice: "$2,464.54" },
        { id: "b", amount: 3000, formattedPrice: "$30.00" },
        { id: "c", amount: 246454, formattedPrice: "$2,464.54" },
      ]),
    ).toBe("from $30.00");
  });

  test("quotes the cheapest variant, never the family's own price", () => {
    // A parent can carry a price no variant has: one catalogue prices the
    // parent at $20.00 while its variants run $10.00 to $15.00.
    expect(
      resolveFamilyPrice([
        { id: "a", amount: 1500, formattedPrice: "$15.00" },
        { id: "b", amount: 1000, formattedPrice: "$10.00" },
        { id: "c", amount: 1200, formattedPrice: "$12.00" },
      ]),
    ).toBe("from $10.00");
  });

  test("returns nothing when no variant carries a price", () => {
    expect(resolveFamilyPrice([{ id: "a" }, { id: "b" }])).toBeUndefined();
    expect(resolveFamilyPrice([])).toBeUndefined();
  });

  test("ignores variants with no price when others have one", () => {
    expect(
      resolveFamilyPrice([
        { id: "a" },
        { id: "b", amount: 500, formattedPrice: "$5.00" },
      ]),
    ).toBe("$5.00");
  });

  test("treats a single priced variant as a single price, not a from price", () => {
    expect(
      resolveFamilyPrice([{ id: "a", amount: 500, formattedPrice: "$5.00" }]),
    ).toBe("$5.00");
  });

  test("keeps a genuine zero price", () => {
    expect(
      resolveFamilyPrice([
        { id: "a", amount: 0, formattedPrice: "$0.00" },
        { id: "b", amount: 0, formattedPrice: "$0.00" },
      ]),
    ).toBe("$0.00");
  });
});
