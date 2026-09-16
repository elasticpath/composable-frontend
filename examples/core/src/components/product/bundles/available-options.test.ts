import { describe, test, expect } from "vitest"
import type { ComponentProductOption, Product } from "@epcc-sdk/sdks-shopper"
import { selectAvailableOptions } from "./available-options"

const option = (id: string): ComponentProductOption =>
  ({ id, type: "product", quantity: 1 }) as ComponentProductOption

const product = (id: string): Product => ({ id }) as Product

describe("selectAvailableOptions", () => {
  test("keeps the options whose product the catalog returned", () => {
    const options = [option("a"), option("b")]

    expect(
      selectAvailableOptions(options, [product("a"), product("b")]),
    ).toEqual(options)
  })

  test("drops an option whose product is not in the shopper's catalog", () => {
    const available = option("a")

    expect(
      selectAvailableOptions(
        [available, option("unpublished")],
        [product("a")],
      ),
    ).toEqual([available])
  })

  test("drops every option when the catalog returned no component products", () => {
    expect(selectAvailableOptions([option("a"), option("b")], [])).toEqual([])
  })

  test("drops an option with no id, which can match no product", () => {
    expect(
      selectAvailableOptions(
        [{ type: "product" } as ComponentProductOption],
        [product("a")],
      ),
    ).toEqual([])
  })

  test("does not mutate the options it was given", () => {
    const options = [option("b"), option("a")]

    selectAvailableOptions(options, [product("a"), product("b")])

    expect(options.map((o) => o.id)).toEqual(["b", "a"])
  })
})
