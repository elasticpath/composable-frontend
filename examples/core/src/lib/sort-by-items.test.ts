import { describe, test, expect } from "vitest"
import { buildSortByItems } from "./sort-by-items"
import { INDEX_NAME } from "./instantsearch-routing"

describe("buildSortByItems", () => {
  test("puts relevance first, mapped to the unsorted index", () => {
    const [first] = buildSortByItems("USD")

    expect(first).toEqual({ label: "Relevance", value: INDEX_NAME })
  })

  test("builds price sorts against the given currency", () => {
    const items = buildSortByItems("GBP")

    expect(items).toEqual([
      { label: "Relevance", value: INDEX_NAME },
      {
        label: "Price (Low to High)",
        value: `${INDEX_NAME}/sort/price.GBP.float_price:asc`,
      },
      {
        label: "Price (High to Low)",
        value: `${INDEX_NAME}/sort/price.GBP.float_price:desc`,
      },
    ])
  })

  test("keeps every value unique so the sort control can key on it", () => {
    const values = buildSortByItems("USD").map((item) => item.value)

    expect(new Set(values).size).toBe(values.length)
  })
})

describe("sort order values", () => {
  const INDEX_NAME_MATCHING_REGEX = new RegExp("^(.+?)(?=(/sort/(.*))|$)")

  test.each([
    ["Price (Low to High)", "price.USD.float_price:asc"],
    ["Price (High to Low)", "price.USD.float_price:desc"],
  ])("%s asks the adapter for sort_by %s", (label, expectedSortBy) => {
    const item = buildSortByItems("USD").find((entry) => entry.label === label)!
    const [, collection, , sortBy] = item.value.match(
      INDEX_NAME_MATCHING_REGEX,
    )!

    expect(collection).toBe(INDEX_NAME)
    expect(sortBy).toBe(expectedSortBy)
  })

  test("relevance asks the adapter for no sort at all", () => {
    const [relevance] = buildSortByItems("USD")
    const [, collection, , sortBy] = relevance!.value.match(
      INDEX_NAME_MATCHING_REGEX,
    )!

    expect(collection).toBe(INDEX_NAME)
    expect(sortBy).toBeUndefined()
  })
})
