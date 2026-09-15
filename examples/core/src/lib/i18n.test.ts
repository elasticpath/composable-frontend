import { describe, test, expect } from "vitest"
import {
  getCurrencyCodeForLocale,
  LOCALE_TO_CURRENCY,
  SUPPORTED_LOCALES,
} from "./i18n"

describe("getCurrencyCodeForLocale", () => {
  test("maps a supported locale to its currency", () => {
    expect(getCurrencyCodeForLocale("en-GB")).toBe("GBP")
    expect(getCurrencyCodeForLocale("de")).toBe("EUR")
  })

  test("falls back to USD for an unmapped locale", () => {
    expect(getCurrencyCodeForLocale("xx")).toBe("USD")
  })

  test("covers every supported locale, so the currency never flips", () => {
    const unmapped = SUPPORTED_LOCALES.filter(
      (locale) => !LOCALE_TO_CURRENCY[locale],
    )

    expect(unmapped).toEqual([])
  })

  test("falls back to USD when there is no locale", () => {
    expect(getCurrencyCodeForLocale(undefined)).toBe("USD")
  })
})
