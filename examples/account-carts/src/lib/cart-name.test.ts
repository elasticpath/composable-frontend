import { describe, expect, test } from "vitest"
import { CART_NAME_MAX_LENGTH, parseCartName } from "./cart-name"

describe("parseCartName", () => {
  test("accepts a name and trims the space around it", () => {
    expect(parseCartName("  Weekly order  ")).toEqual({
      ok: true,
      name: "Weekly order",
    })
  })

  test("refuses a name that is empty or only space", () => {
    expect(parseCartName("")).toMatchObject({ ok: false })
    expect(parseCartName("   ")).toMatchObject({ ok: false })
  })

  test("accepts a name of exactly the longest length Elastic Path allows", () => {
    const name = "a".repeat(CART_NAME_MAX_LENGTH)

    expect(parseCartName(name)).toEqual({ ok: true, name })
  })

  test("refuses a name one character over the longest length", () => {
    expect(parseCartName("a".repeat(CART_NAME_MAX_LENGTH + 1))).toMatchObject({
      ok: false,
    })
  })

  test("refuses a name with a control character in it", () => {
    expect(parseCartName("Weekly\norder")).toMatchObject({ ok: false })
    expect(parseCartName("Weekly\u0000order")).toMatchObject({ ok: false })
  })

  test("accepts special characters, which Elastic Path permits", () => {
    expect(parseCartName("Q4 (urgent) - café #2")).toEqual({
      ok: true,
      name: "Q4 (urgent) - café #2",
    })
  })

  test("every refusal tells the shopper what to change", () => {
    for (const input of ["", "a".repeat(CART_NAME_MAX_LENGTH + 1), "a\nb"]) {
      const result = parseCartName(input)
      expect(result.ok === false && result.problem.length > 0).toBe(true)
    }
  })
})
