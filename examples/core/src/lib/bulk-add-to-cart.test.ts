import { describe, expect, test } from "vitest";
import {
  buildBulkAddRequest,
  describeBulkAddFailure,
} from "./bulk-add-to-cart";

describe("buildBulkAddRequest", () => {
  test("sends one cart_item per selected product, quantity 1 each", () => {
    expect(buildBulkAddRequest(["prod-a", "tee-md-blue"]).data).toEqual([
      { type: "cart_item", id: "prod-a", quantity: 1 },
      { type: "cart_item", id: "tee-md-blue", quantity: 1 },
    ]);
  });

  test("asks for all or nothing explicitly, never relying on the API default of false", () => {
    expect(buildBulkAddRequest(["prod-a"]).options).toEqual({
      add_all_or_nothing: true,
    });
  });

  test("a product selected twice is sent once", () => {
    expect(buildBulkAddRequest(["prod-a", "prod-a"]).data).toHaveLength(1);
  });
});

const selection = [
  { cardId: "c1", productId: "controller", productName: "Playstation 5 Controller" },
  { cardId: "c2", productId: "fortnite", productName: "Fortnite - PS5" },
];

const rejectedBatch = {
  errors: [
    {
      status: 404,
      title: "Product not found",
      detail: "product ID 'gone' not found in catalog release 'latestPublished'",
      meta: { id: "gone" },
    },
    {
      status: 400,
      title: "Insufficient stock",
      detail: "There is not enough stock to add Playstation 5 Controller to your cart",
      meta: { id: "controller", sku: "ps5-controller" },
    },
  ],
};

describe("describeBulkAddFailure", () => {
  test("says nothing was added, because the batch is all or nothing", () => {
    expect(
      describeBulkAddFailure({ error: rejectedBatch, products: selection })
        .summary,
    ).toBe("Nothing was added to your cart.");
  });

  test("names each product the cart refused, by the id the error carries, with the reason", () => {
    expect(
      describeBulkAddFailure({ error: rejectedBatch, products: selection })
        .problems,
    ).toEqual([
      "A selected product: Product not found",
      "Playstation 5 Controller: Insufficient stock",
    ]);
  });

  test("a server error does not claim to know the cart's state", () => {
    expect(
      describeBulkAddFailure({
        error: { errors: [{ status: 503, title: "Service Unavailable" }] },
        products: selection,
      }),
    ).toEqual({
      summary: "We could not confirm whether your cart changed. Check it before trying again.",
      problems: [],
    });
  });

  test("an error with no item list does not claim to know the cart's state", () => {
    expect(
      describeBulkAddFailure({ error: { errors: [] }, products: selection })
        .summary,
    ).toBe("We could not confirm whether your cart changed. Check it before trying again.");
  });

  test("when the request never answered, does not claim to know the cart's state", () => {
    expect(
      describeBulkAddFailure({ error: undefined, products: selection }),
    ).toEqual({
      summary: "We could not confirm whether your cart changed. Check it before trying again.",
      problems: [],
    });
  });
});
