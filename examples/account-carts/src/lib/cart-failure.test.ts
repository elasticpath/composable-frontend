import { describe, expect, test } from "vitest"
import { CartsUnavailableError } from "./carts-port"
import { describeFailure } from "./cart-failure"
import {
  ADD_REFUSED_MESSAGE,
  CART_GONE_MESSAGE,
  NOT_ANSWERING_MESSAGE,
  OUT_OF_STOCK_MESSAGE,
} from "./messages"

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

  test("says the product is out of stock when Elastic Path refuses the add for stock", () => {
    const message = describeFailure(
      refusedWith(400, "Insufficient stock"),
      "add",
    )

    expect(message).toBe(OUT_OF_STOCK_MESSAGE)
    expect(message).not.toContain("raw detail")
    expect(message).not.toContain("Insufficient stock")
  })

  test("says Elastic Path would not add the product for any other refusal of the add", () => {
    expect(describeFailure(refusedWith(400, "Bad request"), "add")).toBe(
      ADD_REFUSED_MESSAGE,
    )
    expect(describeFailure(refusedWith(422), "add")).toBe(ADD_REFUSED_MESSAGE)
  })

  test("says the product is not available when the add is answered 404", () => {
    expect(describeFailure(refusedWith(404), "add")).toBe(ADD_REFUSED_MESSAGE)
  })

  test("keeps the rate-limit and not-allowed messages for an add", () => {
    expect(describeFailure(refusedWith(429), "add")).toContain("moment")
    expect(describeFailure(refusedWith(403), "add")).toContain("not allowed")
  })

  test("keeps the not-answering message for a server error or network failure on an add", () => {
    expect(describeFailure(refusedWith(500), "add")).toBe(NOT_ANSWERING_MESSAGE)
    expect(
      describeFailure(
        new CartsUnavailableError("adding the product to the cart", {
          cause: new TypeError("fetch failed"),
        }),
        "add",
      ),
    ).toBe(NOT_ANSWERING_MESSAGE)
  })

  test("does not treat an insufficient-stock title as out of stock on other actions", () => {
    expect(
      describeFailure(refusedWith(400, "Insufficient stock"), "delete"),
    ).not.toBe(OUT_OF_STOCK_MESSAGE)
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
