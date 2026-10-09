import { describe, expect, it } from "vitest"
import { zGetAllFilesQuery, zOffset, zPageLimit, zPageOffset } from "./zod"

describe.each([
  ["zOffset", zOffset],
  ["zPageOffset", zPageOffset],
  ["zPageLimit", zPageLimit],
])("%s", (_, schema) => {
  it("parses a number to the same number", () => {
    expect(schema.parse(0)).toBe(0)
  })

  it("parses a query string value to a number", () => {
    expect(schema.parse("20")).toBe(20)
  })

  it.each([
    ["not numeric", "abc"],
    ["fractional", 1.5],
    ["below the declared minimum", -1],
    ["that is a boolean", true],
    ["that is null", null],
  ])("rejects a value %s", (_, value) => {
    expect(schema.safeParse(value).success).toBe(false)
  })
})

describe.each([
  ["zOffset", zOffset],
  ["zPageOffset", zPageOffset],
])("%s", (_, schema) => {
  it("accepts the declared maximum of 10000 and rejects 10001", () => {
    expect(schema.parse(10000)).toBe(10000)
    expect(schema.safeParse(10001).success).toBe(false)
  })
})

describe("zGetAllFilesQuery", () => {
  it("parses the page parameters of a URL query to numbers", () => {
    expect(
      zGetAllFilesQuery.parse({ "page[offset]": "40", "page[limit]": "20" }),
    ).toEqual({ "page[offset]": 40, "page[limit]": 20 })
  })

  it("rejects a page parameter that is not numeric", () => {
    expect(zGetAllFilesQuery.safeParse({ "page[offset]": "abc" }).success).toBe(
      false,
    )
  })
})
