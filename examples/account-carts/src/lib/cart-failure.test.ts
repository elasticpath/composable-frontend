import { describe, expect, test } from "vitest"
import { CartsUnavailableError } from "./carts-port"
import { describeFailure } from "./cart-failure"
import { CART_GONE_MESSAGE, NOT_ANSWERING_MESSAGE } from "./cart-messages"

const refusedWith = (status: number, title = "refused") =>
  new CartsUnavailableError("deleting the cart", {
    cause: { errors: [{ status, title, detail: "raw detail from the API" }] },
  })

describe("describeFailure", () => {
  test("says the cart is gone when Elastic Path answers 404", () => {
    expect(describeFailure(refusedWith(404), "delete")).toBe(CART_GONE_MESSAGE)
  })

  test("explains the last-cart refusal without quoting the API", () => {
    const message = describeFailure(refusedWith(400, "Last cart"), "delete")

    expect(message).toContain("only cart")
    expect(message).not.toContain("raw detail")
  })

  test("says the account may not change the cart when Elastic Path answers 403", () => {
    expect(describeFailure(refusedWith(403), "rename")).toContain("not allowed")
  })

  test("asks for a different name when a rename is refused as invalid", () => {
    expect(describeFailure(refusedWith(422), "rename")).toContain("name")
    expect(describeFailure(refusedWith(400), "rename")).toContain("name")
  })

  test("does not blame a name when a delete is refused as invalid", () => {
    expect(describeFailure(refusedWith(422), "delete")).not.toContain("name")
  })

  test("asks the shopper to wait when Elastic Path rate limits", () => {
    expect(describeFailure(refusedWith(429), "resume")).toContain("moment")
  })

  test("reads a refusal that is a single error rather than a list", () => {
    const error = new CartsUnavailableError("renaming the cart", {
      cause: { status: 422, title: "Validation error" },
    })

    expect(describeFailure(error, "rename")).toContain("name")
  })

  test("says Elastic Path is not answering for a server error", () => {
    expect(describeFailure(refusedWith(503), "delete")).toBe(
      NOT_ANSWERING_MESSAGE,
    )
  })

  test("says Elastic Path is not answering for a network failure", () => {
    const error = new CartsUnavailableError("deleting the cart", {
      cause: new TypeError("fetch failed"),
    })

    expect(describeFailure(error, "delete")).toBe(NOT_ANSWERING_MESSAGE)
  })

  test("never repeats the raw text of an unrecognised refusal", () => {
    const message = describeFailure(refusedWith(409, "Conflict"), "resume")

    expect(message).not.toContain("raw detail")
    expect(message).not.toContain("Conflict")
    expect(message.length).toBeGreaterThan(0)
  })

  test("gives a plain message for an error that did not come from Elastic Path", () => {
    expect(describeFailure(new Error("boom"), "delete")).toBe(
      NOT_ANSWERING_MESSAGE,
    )
    expect(describeFailure("boom", "delete")).toBe(NOT_ANSWERING_MESSAGE)
  })
})
