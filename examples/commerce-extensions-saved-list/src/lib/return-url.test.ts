import { describe, expect, test } from "vitest"
import { safeReturnPath } from "./return-url"

describe("safeReturnPath", () => {
  test("keeps a path on this site", () => {
    expect(safeReturnPath("/saved-list")).toBe("/saved-list")
    expect(safeReturnPath("/?page=2#top")).toBe("/?page=2#top")
  })

  test("falls back when there is nothing to return to", () => {
    expect(safeReturnPath(undefined)).toBe("/saved-list")
    expect(safeReturnPath("")).toBe("/saved-list")
  })

  test.each([
    "https://evil.example/phish",
    "//evil.example/phish",
    "/\\evil.example/phish",
    "\\\\evil.example/phish",
    "javascript:alert(1)",
    "saved-list",
  ])("refuses to send a shopper off site: %s", (returnUrl) => {
    expect(safeReturnPath(returnUrl)).toBe("/saved-list")
  })
})
