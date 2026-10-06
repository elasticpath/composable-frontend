import { describe, expect, test, vi } from "vitest"
import { CartsUnavailableError } from "./carts-port"
import {
  createSharedCartReader,
  type SharedCartSdk,
} from "./shared-cart-reader"

const withItems = {
  data: { meta: { display_price: { with_tax: { formatted: "$20.00" } } } },
  included: {
    items: [
      {
        id: "item-mug",
        product_id: "product-mug",
        type: "cart_item",
        name: "Mug",
        quantity: 2,
        meta: {
          display_price: { with_tax: { value: { formatted: "$20.00" } } },
        },
      },
    ],
  },
}

function readerOver(getACart: unknown) {
  const sdk = { getACart } as unknown as SharedCartSdk
  return createSharedCartReader({
    serverToken: async () => "server-token",
    sdk,
  })
}

const answered = (status: number, body: Record<string, unknown>) =>
  vi.fn(async () => ({ response: { status }, ...body }))

describe("createSharedCartReader", () => {
  test("reads the cart with its items using the server token and no account token", async () => {
    const getACart = answered(200, { data: withItems, error: undefined })

    await readerOver(getACart)("shared")

    const call = (getACart.mock.calls[0] as unknown[])[0] as {
      headers: Record<string, string>
      path: unknown
      query: unknown
    }
    expect(call.headers).toEqual({ Authorization: "Bearer server-token" })
    expect(call.path).toEqual({ cartID: "shared" })
    expect(call.query).toEqual({ include: ["items"] })
  })

  test("gives the cart's lines and total", async () => {
    const cart = await readerOver(
      answered(200, { data: withItems, error: undefined }),
    )("shared")

    expect(cart?.lines.map((line) => line.name)).toEqual(["Mug"])
    expect(cart?.total).toBe("$20.00")
  })

  test("reads a cart that Elastic Path no longer holds as gone", async () => {
    const cart = await readerOver(
      answered(404, { data: undefined, error: { errors: [{ status: 404 }] } }),
    )("shared")

    expect(cart).toBeNull()
  })

  test("reads the empty cart Elastic Path answers for an expired cart as gone", async () => {
    const cart = await readerOver(
      answered(200, { data: { data: {} }, error: undefined }),
    )("shared")

    expect(cart).toBeNull()
  })

  test("is a failure, not a gone cart, when Elastic Path answers with a server error", async () => {
    await expect(
      readerOver(
        answered(503, {
          data: undefined,
          error: { errors: [{ status: 503 }] },
        }),
      )("shared"),
    ).rejects.toThrow(CartsUnavailableError)
  })

  test("is a failure, not a gone cart, when the request never gets an answer", async () => {
    const getACart = vi.fn(async () => {
      throw new TypeError("fetch failed")
    })

    await expect(readerOver(getACart)("shared")).rejects.toThrow(
      CartsUnavailableError,
    )
  })
})
