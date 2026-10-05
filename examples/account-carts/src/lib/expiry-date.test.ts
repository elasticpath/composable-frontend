import { describe, expect, test } from "vitest"
import { NO_EXPIRY_DATE, formatExpiryDate } from "./expiry-date"

describe("formatExpiryDate", () => {
  test("shows the day, month and year", () => {
    expect(formatExpiryDate("2026-10-12T15:22:03Z")).toBe("12 Oct 2026")
  })

  test("shows the date in UTC, so the server's time zone does not move it", () => {
    expect(formatExpiryDate("2026-10-12T23:59:59Z")).toBe("12 Oct 2026")
    expect(formatExpiryDate("2026-10-13T00:00:00Z")).toBe("13 Oct 2026")
  })

  test("says there is no expiry date when the cart has none", () => {
    expect(formatExpiryDate(undefined)).toBe(NO_EXPIRY_DATE)
  })

  test("says there is no expiry date when the value is not a date", () => {
    expect(formatExpiryDate("soon")).toBe(NO_EXPIRY_DATE)
  })
})
