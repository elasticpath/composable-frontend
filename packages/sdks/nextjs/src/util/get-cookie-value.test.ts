/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest"
import { getCookieValue } from "./get-cookie-value"

describe("getCookieValue", () => {
  beforeEach(() => {
    // Reset document.cookie before each test.
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    })
  })

  it("should return undefined if the cookie is not found", () => {
    document.cookie = "foo=bar; baz=qux"
    expect(getCookieValue("nonexistent")).toBeUndefined()
  })

  it("should return the cookie value for a single cookie", () => {
    document.cookie = "test=value"
    expect(getCookieValue("test")).toEqual("value")
  })

  it("should return the correct cookie value among multiple cookies", () => {
    document.cookie = "test1=value1; test2=value2; test3=value3"
    expect(getCookieValue("test2")).toEqual("value2")
  })

  it("should decode URL-encoded cookie values", () => {
    const encodedValue = encodeURIComponent("hello world")
    document.cookie = `greeting=${encodedValue}`
    expect(getCookieValue("greeting")).toEqual("hello world")
  })

  it('should correctly handle cookie values with multiple "=" characters', () => {
    // For example, a cookie where the value contains "=" symbols.
    document.cookie = "token=abc=def=ghi"
    expect(getCookieValue("token")).toEqual("abc=def=ghi")
  })
})
