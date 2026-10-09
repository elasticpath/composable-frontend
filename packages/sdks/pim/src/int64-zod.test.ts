import { describe, expect, it } from "vitest"
import { zGetAllProductsQuery, zPageLimit, zPageOffset } from "./zod"

describe.each([
  ["zPageOffset", zPageOffset],
  ["zPageLimit", zPageLimit],
])("%s", (_, schema) => {
  it("parses a number to the same number", () => {
    expect(schema.parse(0)).toBe(0)
  })

  it("parses a query string value to a number", () => {
    expect(schema.parse("20")).toBe(20)
  })

  it("accepts the declared bounds of 0 and 10000", () => {
    expect(schema.parse(10000)).toBe(10000)
  })

  it.each([
    ["below the declared minimum", -1],
    ["above the declared maximum", 10001],
    ["fractional", 1.5],
    ["not numeric", "abc"],
  ])("rejects a value %s", (_, value) => {
    expect(schema.safeParse(value).success).toBe(false)
  })
})

describe("zGetAllProductsQuery", () => {
  it("parses the page parameters of a URL query to numbers", () => {
    expect(
      zGetAllProductsQuery.parse({ "page[offset]": "40", "page[limit]": "20" }),
    ).toEqual({ "page[offset]": 40, "page[limit]": 20 })
  })
})
