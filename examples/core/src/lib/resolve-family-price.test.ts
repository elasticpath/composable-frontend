import { describe, test, expect } from "vitest";
import { resolveFamilyPrice } from "./resolve-family-price";

const usd = (amount: number, formatted: string) => ({
  id: String(amount),
  amount,
  formattedPrice: formatted,
  currency: "USD",
});

describe("resolveFamilyPrice", () => {
  test("gives an exact price when every variant costs the same", () => {
    expect(resolveFamilyPrice([usd(2000, "$20.00"), usd(2000, "$20.00")])).toEqual({
      formatted: "$20.00",
      isFrom: false,
    });
  });

  test("gives a from price when variants are priced differently", () => {
    expect(
      resolveFamilyPrice([
        usd(246454, "$2,464.54"),
        usd(3000, "$30.00"),
        usd(246454, "$2,464.54"),
      ]),
    ).toEqual({ formatted: "$30.00", isFrom: true });
  });

  test("quotes the cheapest variant, never the family's own price", () => {
    // A parent can carry a price no variant has: $20.00 against variants of
    // $10.00 to $15.00.
    expect(
      resolveFamilyPrice([usd(1500, "$15.00"), usd(1000, "$10.00"), usd(1200, "$12.00")]),
    ).toEqual({ formatted: "$10.00", isFrom: true });
  });

  test("gives a from price when some variants have no price at all", () => {
    // The known prices do not cover the family, so the cheapest known price is
    // a floor rather than the price.
    expect(
      resolveFamilyPrice([{ id: "a" }, { id: "b" }, usd(500, "$5.00")]),
    ).toEqual({ formatted: "$5.00", isFrom: true });
  });

  test("gives an exact price only when every variant is priced and they match", () => {
    expect(resolveFamilyPrice([usd(500, "$5.00")])).toEqual({
      formatted: "$5.00",
      isFrom: false,
    });
    expect(resolveFamilyPrice([usd(500, "$5.00"), { id: "b" }])).toEqual({
      formatted: "$5.00",
      isFrom: true,
    });
  });

  test("returns nothing when no variant carries a price", () => {
    expect(resolveFamilyPrice([{ id: "a" }, { id: "b" }])).toBeUndefined();
    expect(resolveFamilyPrice([])).toBeUndefined();
  });

  test("keeps a genuine zero price", () => {
    expect(resolveFamilyPrice([usd(0, "$0.00"), usd(0, "$0.00")])).toEqual({
      formatted: "$0.00",
      isFrom: false,
    });
  });

  describe("currency", () => {
    test("never quotes a price from another currency, and treats it as unknown", () => {
      // The GBP variant cannot be compared, so the matching USD prices are a
      // floor rather than the price of every variant.
      expect(
        resolveFamilyPrice(
          [
            { id: "a", amount: 100, formattedPrice: "£1.00", currency: "GBP" },
            usd(3000, "$30.00"),
            usd(3000, "$30.00"),
          ],
          "USD",
        ),
      ).toEqual({ formatted: "$30.00", isFrom: true });
    });

    test("returns nothing when no variant is priced in the wanted currency", () => {
      expect(
        resolveFamilyPrice(
          [{ id: "a", amount: 100, formattedPrice: "£1.00", currency: "GBP" }],
          "USD",
        ),
      ).toBeUndefined();
    });

    test("compares every variant when no currency is given", () => {
      expect(resolveFamilyPrice([usd(3000, "$30.00"), usd(1000, "$10.00")])).toEqual({
        formatted: "$10.00",
        isFrom: true,
      });
    });
  });
});
