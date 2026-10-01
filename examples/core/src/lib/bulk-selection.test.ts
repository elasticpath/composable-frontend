import { describe, expect, test } from "vitest";
import {
  bulkSelectionReducer,
  canAddSelection,
  emptyBulkSelection,
  resolveSelectableProduct,
  selectedProductIds,
  selectedProducts,
  type BulkSelection,
} from "./bulk-selection";

describe("resolveSelectableProduct", () => {
  test("a standard product is selected as itself", () => {
    expect(
      resolveSelectableProduct({
        productTypes: ["standard"],
        productId: "shirt",
      }),
    ).toEqual({ selectable: true, productId: "shirt" });
  });

  test("a family card with every option chosen selects the resolved variant, not the parent", () => {
    expect(
      resolveSelectableProduct({
        productTypes: ["parent"],
        productId: "tee-family",
        selectedVariantId: "tee-md-blue",
      }),
    ).toEqual({ selectable: true, productId: "tee-md-blue" });
  });

  test("a family card without a complete selection cannot be selected, and says to choose options", () => {
    expect(
      resolveSelectableProduct({
        productTypes: ["parent"],
        productId: "tee-family",
      }),
    ).toEqual({ selectable: false, reason: "Choose options to select" });
  });

  test("a bundle cannot be selected, and points to its product page", () => {
    expect(
      resolveSelectableProduct({
        productTypes: ["bundle"],
        productId: "starter-kit",
      }),
    ).toEqual({
      selectable: false,
      reason: "Bundles are configured on their product page",
    });
  });

  test("a product of unknown type is not offered", () => {
    expect(
      resolveSelectableProduct({ productTypes: undefined, productId: "x" }),
    ).toMatchObject({ selectable: false });
  });
});

const page1 = "page=1";
const page2 = "page=2";

function select(
  state: BulkSelection,
  cardId: string,
  productId: string,
  resultsKey = page1,
) {
  return bulkSelectionReducer(state, {
    type: "toggle",
    resultsKey,
    cardId,
    productId,
    productName: `Name of ${productId}`,
  });
}

describe("bulkSelectionReducer", () => {
  test("toggling a card selects it, and toggling again deselects it", () => {
    const selected = select(emptyBulkSelection, "a", "prod-a");
    expect(selectedProductIds(selected, page1)).toEqual(["prod-a"]);

    const deselected = select(selected, "a", "prod-a");
    expect(selectedProductIds(deselected, page1)).toEqual([]);
  });

  test("a selection keeps each product's name for messages about it", () => {
    const state = select(emptyBulkSelection, "a", "prod-a");
    expect(selectedProducts(state, page1)).toEqual([
      { cardId: "a", productId: "prod-a", productName: "Name of prod-a" },
    ]);
  });

  test("selections from several cards accumulate in the order chosen", () => {
    const state = select(select(emptyBulkSelection, "b", "prod-b"), "a", "prod-a");
    expect(selectedProductIds(state, page1)).toEqual(["prod-b", "prod-a"]);
  });

  test("a selected family card follows the shopper to the variant they switch to", () => {
    const state = bulkSelectionReducer(select(emptyBulkSelection, "tee", "tee-sm"), {
      type: "productChanged",
      cardId: "tee",
      productId: "tee-md",
    });
    expect(selectedProductIds(state, page1)).toEqual(["tee-md"]);
  });

  test("a selected card that stops being purchasable drops out of the selection", () => {
    const state = bulkSelectionReducer(select(emptyBulkSelection, "tee", "tee-sm"), {
      type: "productChanged",
      cardId: "tee",
      productId: undefined,
    });
    expect(selectedProductIds(state, page1)).toEqual([]);
  });

  test("a product change on an unselected card does not select it", () => {
    const state = bulkSelectionReducer(emptyBulkSelection, {
      type: "productChanged",
      cardId: "tee",
      productId: "tee-md",
    });
    expect(selectedProductIds(state, page1)).toEqual([]);
  });

  test("changing page, query, refinement or sort clears the selection", () => {
    const state = bulkSelectionReducer(select(emptyBulkSelection, "a", "prod-a"), {
      type: "resultsChanged",
      resultsKey: page2,
    });
    expect(selectedProductIds(state, page2)).toEqual([]);
  });

  test("returning to the earlier results does not bring the old selection back", () => {
    const onPage2 = bulkSelectionReducer(select(emptyBulkSelection, "a", "prod-a"), {
      type: "resultsChanged",
      resultsKey: page2,
    });
    const backOnPage1 = bulkSelectionReducer(onPage2, {
      type: "resultsChanged",
      resultsKey: page1,
    });
    expect(selectedProductIds(backOnPage1, page1)).toEqual([]);
  });

  test("the same results arriving again keep the selection", () => {
    const state = bulkSelectionReducer(select(emptyBulkSelection, "a", "prod-a"), {
      type: "resultsChanged",
      resultsKey: page1,
    });
    expect(selectedProductIds(state, page1)).toEqual(["prod-a"]);
  });

  test("a selection is never read against results it was not made on", () => {
    const state = select(emptyBulkSelection, "a", "prod-a");
    expect(selectedProductIds(state, page2)).toEqual([]);
  });

  test("a successful add clears the cards it added", () => {
    const state = bulkSelectionReducer(select(emptyBulkSelection, "a", "prod-a"), {
      type: "added",
      cardIds: ["a"],
    });
    expect(selectedProductIds(state, page1)).toEqual([]);
  });

  test("a card ticked while the add was in flight stays selected", () => {
    const state = bulkSelectionReducer(
      select(select(emptyBulkSelection, "a", "prod-a"), "b", "prod-b"),
      { type: "added", cardIds: ["a"] },
    );
    expect(selectedProductIds(state, page1)).toEqual(["prod-b"]);
  });
});

describe("canAddSelection", () => {
  test("an empty selection disables the action", () => {
    expect(canAddSelection({ productIds: [], isAdding: false })).toBe(false);
  });

  test("a selection enables the action", () => {
    expect(canAddSelection({ productIds: ["prod-a"], isAdding: false })).toBe(
      true,
    );
  });

  test("the action is disabled while an add is in flight", () => {
    expect(canAddSelection({ productIds: ["prod-a"], isAdding: true })).toBe(
      false,
    );
  });
});
