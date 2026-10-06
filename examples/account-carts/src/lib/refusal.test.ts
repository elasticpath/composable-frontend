import { describe, expect, test } from "vitest"
import { CartsUnavailableError } from "./carts-port"
import { firstRefusalIn, refusalsIn } from "./refusal"

const refusedWith = (cause: unknown) =>
  new CartsUnavailableError("doing something", { cause })

describe("refusalsIn", () => {
  test("reads every error Elastic Path listed, with status, title and the product it names", () => {
    const refusals = refusalsIn(
      refusedWith({
        errors: [
          { status: 404, title: "Not found", meta: { id: "product-1" } },
          { status: "400", title: "Insufficient stock" },
        ],
      }),
    )

    expect(refusals).toEqual([
      { status: 404, title: "Not found", productRef: "product-1" },
      { status: 400, title: "Insufficient stock", productRef: undefined },
    ])
  })

  test("reads a cause that is itself one error", () => {
    expect(refusalsIn(refusedWith({ status: 403 }))).toEqual([
      { status: 403, title: undefined, productRef: undefined },
    ])
  })

  test("reads nothing when any listed error has no numeric status", () => {
    expect(
      refusalsIn(
        refusedWith({ errors: [{ status: 400 }, { title: "no status" }] }),
      ),
    ).toEqual([])
  })

  test("reads nothing from an error that is not a CartsUnavailableError", () => {
    expect(refusalsIn(new Error("boom"))).toEqual([])
    expect(refusalsIn({ errors: [{ status: 400 }] })).toEqual([])
  })

  test("reads nothing when the cause is missing or not an object", () => {
    expect(refusalsIn(new CartsUnavailableError("x"))).toEqual([])
    expect(refusalsIn(refusedWith("text"))).toEqual([])
  })
})

describe("firstRefusalIn", () => {
  test("reads the first listed error even when a later one is unreadable", () => {
    expect(
      firstRefusalIn(
        refusedWith({ errors: [{ status: 429 }, { title: "no status" }] }),
      )?.status,
    ).toBe(429)
  })

  test("reads nothing from a list with no errors", () => {
    expect(firstRefusalIn(refusedWith({ errors: [] }))).toBeUndefined()
  })
})
