import { describe, expect, test } from "vitest"
import { CartsUnavailableError } from "./carts-port"
import { describeMergeFailure } from "./merge-failure"
import {
  COULD_NOT_CONFIRM_MERGE_MESSAGE,
  NOTHING_MERGED_MESSAGE,
  NOT_ANSWERING_MESSAGE,
} from "./messages"
import type { SharedLine } from "./shared-cart"

const lines: SharedLine[] = [
  {
    id: "item-mug",
    productId: "product-mug",
    name: "Mug",
    quantity: 2,
    lineTotal: "$20.00",
  },
  {
    id: "item-poster",
    productId: "product-poster",
    name: "Poster",
    quantity: 1,
    lineTotal: "$10.00",
  },
]

const mergeRefusedWith = (errors: unknown[]) =>
  new CartsUnavailableError("merging the shared cart", { cause: { errors } })

describe("describeMergeFailure when Elastic Path refuses the merge", () => {
  test("says nothing was added and names each refused product with its reason", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([
        {
          status: 404,
          title: "Product not found",
          meta: { id: "product-mug" },
        },
        {
          status: 400,
          title: "Insufficient stock",
          meta: { id: "product-poster" },
        },
      ]),
      lines,
    })

    expect(failure).toEqual({
      summary: NOTHING_MERGED_MESSAGE,
      problems: ["Mug: no longer available", "Poster: not enough stock"],
    })
  })

  test("names a product whether the API echoes its product id or its cart item id", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([
        { status: 400, title: "Insufficient stock", meta: { id: "item-mug" } },
      ]),
      lines,
    })

    expect(failure.problems).toEqual(["Mug: not enough stock"])
  })

  test("falls back to a generic name when the refused id is not in the shared cart", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([
        { status: 400, title: "Insufficient stock", meta: { id: "unknown" } },
        { status: 400, title: "Insufficient stock" },
      ]),
      lines,
    })

    expect(failure.problems).toEqual([
      "A shared product: not enough stock",
      "A shared product: not enough stock",
    ])
  })

  test("says only that nothing was added when a 400 names no product and gives no stock or refusal title", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([
        { status: 400, title: "Bad request", detail: "malformed body" },
      ]),
      lines,
    })

    expect(failure).toEqual({ summary: NOTHING_MERGED_MESSAGE, problems: [] })
  })

  test("lists only the refusals that name a product when a bare 400 comes with them", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([
        { status: 400, title: "Bad request" },
        { status: 404, title: "Product not found", meta: { id: "item-mug" } },
      ]),
      lines,
    })

    expect(failure).toEqual({
      summary: NOTHING_MERGED_MESSAGE,
      problems: ["Mug: no longer available"],
    })
  })

  test("gives a plain reason for a title it does not recognise instead of quoting the API", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([
        {
          status: 422,
          title: "Raw API title",
          detail: "raw detail from the API",
          meta: { id: "product-mug" },
        },
      ]),
      lines,
    })

    expect(failure.problems).toEqual(["Mug: could not be added"])
    expect(JSON.stringify(failure)).not.toContain("Raw API title")
    expect(JSON.stringify(failure)).not.toContain("raw detail")
  })

  test("reads a refusal that is a single error rather than a list", () => {
    const failure = describeMergeFailure({
      error: new CartsUnavailableError("merging the shared cart", {
        cause: { status: 400, title: "Insufficient stock" },
      }),
      lines,
    })

    expect(failure.summary).toBe(NOTHING_MERGED_MESSAGE)
    expect(failure.problems).toEqual(["A shared product: not enough stock"])
  })
})

describe("describeMergeFailure when the outcome is not a refusal of a product", () => {
  test("does not claim the cart is unchanged when Elastic Path fails with a server error", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([{ status: 503, title: "Unavailable" }]),
      lines,
    })

    expect(failure).toEqual({
      summary: COULD_NOT_CONFIRM_MERGE_MESSAGE,
      problems: [],
    })
  })

  test("does not claim the cart is unchanged when the request never got an answer", () => {
    const failure = describeMergeFailure({
      error: new CartsUnavailableError("merging the shared cart", {
        cause: new TypeError("fetch failed"),
      }),
      lines,
    })

    expect(failure).toEqual({
      summary: COULD_NOT_CONFIRM_MERGE_MESSAGE,
      problems: [],
    })
  })

  test("does not claim the cart is unchanged when the error list is empty", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([]),
      lines,
    })

    expect(failure.summary).toBe(COULD_NOT_CONFIRM_MERGE_MESSAGE)
  })

  test("does not claim the cart is unchanged when a refusal comes with a server error", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([
        { status: 400, title: "Insufficient stock", meta: { id: "item-mug" } },
        { status: 500, title: "Internal" },
      ]),
      lines,
    })

    expect(failure).toEqual({
      summary: COULD_NOT_CONFIRM_MERGE_MESSAGE,
      problems: [],
    })
  })

  test("does not claim the cart is unchanged for an error that is not from Elastic Path", () => {
    expect(
      describeMergeFailure({ error: new Error("boom"), lines }).summary,
    ).toBe(COULD_NOT_CONFIRM_MERGE_MESSAGE)
  })

  test("says the account may not change the cart when Elastic Path answers 403", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([{ status: 403, title: "Forbidden" }]),
      lines,
    })

    expect(failure.summary).toContain("not allowed")
    expect(failure.problems).toEqual([])
  })

  test("asks the shopper to wait when Elastic Path rate limits", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([{ status: 429, title: "Too many requests" }]),
      lines,
    })

    expect(failure.summary).toContain("moment")
  })

  test("never tells the shopper to retry blindly after a failure that may have changed the cart", () => {
    const failure = describeMergeFailure({
      error: mergeRefusedWith([{ status: 502, title: "Bad gateway" }]),
      lines,
    })

    expect(failure.summary).not.toBe(NOT_ANSWERING_MESSAGE)
    expect(failure.summary).toContain("Check")
  })
})
