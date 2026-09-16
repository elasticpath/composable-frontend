import { describe, test, expect } from "vitest";
import { sortBySortOrder } from "./sort-by-sort-order";

describe("sortBySortOrder", () => {
  test("orders by the merchandiser's sort_order, treating zero as a real position", () => {
    expect(
      sortBySortOrder([
        { name: "lg", sort_order: 2 },
        { name: "sm", sort_order: 0 },
        { name: "md", sort_order: 1 },
      ]).map((entry) => entry.name),
    ).toEqual(["sm", "md", "lg"]);
  });

  test("puts entries without a sort_order after those that have one", () => {
    expect(
      sortBySortOrder([
        { name: "unordered" },
        { name: "first", sort_order: 1 },
      ]).map((entry) => entry.name),
    ).toEqual(["first", "unordered"]);
  });

  test("orders entries without a sort_order by name, so the result does not depend on API order", () => {
    const ordering = sortBySortOrder([
      { name: "Testerson" },
      { name: "Size" },
    ]).map((entry) => entry.name);

    // The same set, handed over in the opposite order, must come back the same.
    const reversed = sortBySortOrder([
      { name: "Size" },
      { name: "Testerson" },
    ]).map((entry) => entry.name);

    expect(ordering).toEqual(["Size", "Testerson"]);
    expect(reversed).toEqual(ordering);
  });

  test("leaves entries with neither sort_order nor name in their original order", () => {
    const entries: Array<{ id: string; name?: string }> = [{ id: "b" }, { id: "a" }];
    expect(sortBySortOrder(entries).map((entry) => entry.id)).toEqual(["b", "a"]);
  });

  test("does not mutate the array it is given", () => {
    const entries = [{ name: "b", sort_order: 2 }, { name: "a", sort_order: 1 }];
    sortBySortOrder(entries);
    expect(entries.map((entry) => entry.name)).toEqual(["b", "a"]);
  });
});
