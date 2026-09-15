import { describe, test, expect } from "vitest";
import { resolveCardPrice } from "./resolve-card-price";

// A currency as the API returns one: `format` is what puts the symbol in place.
const USD = { code: "USD", decimal_places: 2, format: "${price}" };
// Without a `format`, formatCurrency falls back to "{price} {code}".
const BARE_USD = { code: "USD", decimal_places: 2 };

describe("resolveCardPrice", () => {
  test("prefers the selected variant's price over the family's", () => {
    expect(
      resolveCardPrice({
        hit: { meta: { display_price: { with_tax: { currency: "USD", formatted: "$2,464.54" } } } },
        variantPrice: "$30.00",
        preferredCurrency: USD,
      }),
    ).toBe("$30.00");
  });

  test("falls back to the family's display price when no variant is selected", () => {
    expect(
      resolveCardPrice({
        hit: { meta: { display_price: { with_tax: { currency: "USD", formatted: "$21.50" } } } },
        preferredCurrency: USD,
      }),
    ).toBe("$21.50");
  });

  test("ignores a display price quoted in another currency", () => {
    expect(
      resolveCardPrice({
        hit: {
          meta: { display_price: { with_tax: { currency: "GBP", formatted: "£18.00" } } },
          attributes: { price: { USD: { amount: 2150 } } },
        },
        preferredCurrency: USD,
      }),
    ).toBe("$21.50");
  });

  test("formats the raw amount when there is no display price", () => {
    expect(
      resolveCardPrice({
        hit: { attributes: { price: { USD: { amount: 999 } } } },
        preferredCurrency: USD,
      }),
    ).toBe("$9.99");
  });

  test("formats through the currency's own format string", () => {
    expect(
      resolveCardPrice({
        hit: { attributes: { price: { USD: { amount: 999 } } } },
        preferredCurrency: BARE_USD,
      }),
    ).toBe("9.99 USD");
  });

  test("returns nothing when the product has no price at all", () => {
    // A card must not invent $0.00 for a product the catalogue prices nowhere.
    expect(resolveCardPrice({ hit: { attributes: {} }, preferredCurrency: USD })).toBeUndefined();
    expect(resolveCardPrice({ hit: {}, preferredCurrency: USD })).toBeUndefined();
    expect(resolveCardPrice({ preferredCurrency: USD })).toBeUndefined();
  });

  test("keeps a genuine zero price, which is not the same as having none", () => {
    expect(
      resolveCardPrice({
        hit: { attributes: { price: { USD: { amount: 0 } } } },
        preferredCurrency: USD,
      }),
    ).toBe("$0.00");
  });

  test("defaults to USD when no preferred currency is known", () => {
    expect(
      resolveCardPrice({ hit: { attributes: { price: { USD: { amount: 1000 } } } } }),
    ).toBe("10.00 USD");
  });
});
