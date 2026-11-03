import { describe, expect, test } from "vitest"
import {
  UNKNOWN_SHARE_DATE,
  formatSharedDate,
  shareLinkPath,
  shareLinkUrl,
} from "./share-link"

const TOKEN = "T".repeat(43)

describe("shareLinkUrl", () => {
  test("is the site's address, a fixed path and the token, and nothing else", () => {
    expect(shareLinkUrl("https://shop.example.test", TOKEN)).toBe(
      `https://shop.example.test/share/${TOKEN}`,
    )
  })

  test("carries no query string or fragment", () => {
    const url = new URL(shareLinkUrl("http://localhost:3000", TOKEN))

    expect(url.search).toBe("")
    expect(url.hash).toBe("")
  })
})

describe("shareLinkPath", () => {
  test("is the path the share page is opened at", () => {
    expect(shareLinkPath(TOKEN)).toBe(`/share/${TOKEN}`)
  })
})

describe("formatSharedDate", () => {
  test("shows the day the link was made, in UTC", () => {
    expect(formatSharedDate("2026-10-05T23:30:00.000Z")).toBe("5 Oct 2026")
  })

  test("says the date is unknown when the entry holds none", () => {
    expect(formatSharedDate("")).toBe(UNKNOWN_SHARE_DATE)
  })
})
