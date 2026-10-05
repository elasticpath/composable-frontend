import { describe, expect, test, vi, type Mock } from "vitest"
import {
  CARTS_PAGE_SIZE,
  CartsUnavailableError,
  createCartsPort,
  type CartsSdk,
} from "./carts-port"

const ACCOUNT_ID = "account-1"
const ACCOUNT_TOKEN = "account-token"

const ok = (data: unknown) => ({
  data,
  error: undefined,
  response: { status: 200 },
})

const refused = (status = 400) => ({
  data: undefined,
  error: { errors: [{ status, title: "refused" }] },
  response: { status },
})

type MockedSdk = { [K in keyof CartsSdk]: CartsSdk[K] & Mock }

function sdkWith(overrides: Partial<Record<keyof CartsSdk, unknown>> = {}) {
  const sdk = {
    getCarts: vi.fn(async () =>
      ok({ data: [], meta: { results: { total: 0 } } }),
    ),
    createACart: vi.fn(async () => ok({ data: { id: "new-cart" } })),
    createAccountCartAssociation: vi.fn(async () => ok({})),
    updateACart: vi.fn(async () => ok({ data: { id: "cart-1" } })),
    getACart: vi.fn(async () => ok({ data: { id: "cart-1" } })),
    manageCarts: vi.fn(async () => ok({ data: [] })),
    deleteACart: vi.fn(async () => ok({})),
    deleteAccountCartAssociation: vi.fn(async () => ok({})),
    ...overrides,
  }
  return sdk as unknown as MockedSdk
}

function portFor(sdk: CartsSdk) {
  return createCartsPort({
    accountId: ACCOUNT_ID,
    accountToken: ACCOUNT_TOKEN,
    implicitToken: async () => "implicit-token",
    sdk,
  })
}

const networkFailure = async () => {
  throw new TypeError("fetch failed")
}

describe("listCarts", () => {
  test("sends the account token and an implicit bearer", async () => {
    const sdk = sdkWith()

    await portFor(sdk).listCarts()

    const options = sdk.getCarts.mock.calls[0]![0] as {
      headers: Record<string, string>
    }
    expect(options.headers).toEqual({
      Authorization: "Bearer implicit-token",
      "EP-Account-Management-Authentication-Token": ACCOUNT_TOKEN,
    })
  })

  test("reads each cart's id, name, last update, expiry and quote flag", async () => {
    const sdk = sdkWith({
      getCarts: vi.fn(async () =>
        ok({
          data: [
            {
              id: "cart-1",
              name: "Weekly order",
              meta: {
                timestamps: {
                  updated_at: "2026-10-05T09:00:00Z",
                  expires_at: "2026-10-12T09:00:00Z",
                },
              },
            },
            { id: "quote-1", is_quote: true },
          ],
          meta: { results: { total: 2 } },
        }),
      ),
    })

    expect(await portFor(sdk).listCarts()).toEqual([
      {
        id: "cart-1",
        name: "Weekly order",
        updatedAt: "2026-10-05T09:00:00Z",
        expiresAt: "2026-10-12T09:00:00Z",
        isQuote: false,
      },
      {
        id: "quote-1",
        name: undefined,
        updatedAt: undefined,
        expiresAt: undefined,
        isQuote: true,
      },
    ])
  })

  test("keeps reading pages until it has every cart the account holds", async () => {
    const page = (ids: string[], total: number) =>
      ok({ data: ids.map((id) => ({ id })), meta: { results: { total } } })
    const getCarts = vi
      .fn()
      .mockResolvedValueOnce(page(["a", "b"], 3))
      .mockResolvedValueOnce(page(["c"], 3))
    const sdk = sdkWith({ getCarts })

    const carts = await portFor(sdk).listCarts()

    expect(carts.map((cart) => cart.id)).toEqual(["a", "b", "c"])
    expect(getCarts).toHaveBeenCalledTimes(2)
    expect(getCarts.mock.calls[1]![0].query).toEqual({
      "page[limit]": CARTS_PAGE_SIZE,
      "page[offset]": CARTS_PAGE_SIZE,
    })
  })

  test("an Elastic Path error is not read as an account with no carts", async () => {
    const sdk = sdkWith({ getCarts: vi.fn(async () => refused(500)) })

    await expect(portFor(sdk).listCarts()).rejects.toThrow(
      CartsUnavailableError,
    )
  })

  test("a network failure is not read as an account with no carts", async () => {
    const sdk = sdkWith({ getCarts: networkFailure })

    await expect(portFor(sdk).listCarts()).rejects.toThrow(
      CartsUnavailableError,
    )
  })

  test("a failure to mint the implicit token is not read as an account with no carts", async () => {
    const sdk = sdkWith()
    const port = createCartsPort({
      accountId: ACCOUNT_ID,
      accountToken: ACCOUNT_TOKEN,
      implicitToken: async () => {
        throw new Error("token endpoint down")
      },
      sdk,
    })

    await expect(port.listCarts()).rejects.toThrow(CartsUnavailableError)
    expect(sdk.getCarts).not.toHaveBeenCalled()
  })
})

describe("createCart", () => {
  test("creates the cart with the account token, then associates it with the account", async () => {
    const sdk = sdkWith()

    const cartId = await portFor(sdk).createCart()

    expect(cartId).toBe("new-cart")
    const created = sdk.createACart.mock.calls[0]![0] as {
      headers: Record<string, string>
    }
    expect(created.headers["EP-Account-Management-Authentication-Token"]).toBe(
      ACCOUNT_TOKEN,
    )
    expect(sdk.createAccountCartAssociation.mock.calls[0]![0]).toMatchObject({
      path: { cartID: "new-cart" },
      body: { data: [{ type: "account", id: ACCOUNT_ID }] },
    })
  })

  test("a refused create is a failure, and nothing is associated", async () => {
    const sdk = sdkWith({ createACart: vi.fn(async () => refused()) })

    await expect(portFor(sdk).createCart()).rejects.toThrow(
      CartsUnavailableError,
    )
    expect(sdk.createAccountCartAssociation).not.toHaveBeenCalled()
  })

  test("a create that returns no cart id is a failure", async () => {
    const sdk = sdkWith({
      createACart: vi.fn(async () => ok({ data: {} })),
    })

    await expect(portFor(sdk).createCart()).rejects.toThrow(
      CartsUnavailableError,
    )
  })

  test("a refused association is a failure", async () => {
    const sdk = sdkWith({
      createAccountCartAssociation: vi.fn(async () => refused(403)),
    })

    await expect(portFor(sdk).createCart()).rejects.toThrow(
      CartsUnavailableError,
    )
  })

  test("a network failure while creating is a failure", async () => {
    const sdk = sdkWith({ createACart: networkFailure })

    await expect(portFor(sdk).createCart()).rejects.toThrow(
      CartsUnavailableError,
    )
  })
})

describe("renameCart", () => {
  test("renames the named cart with both tokens, sending only the name", async () => {
    const sdk = sdkWith()

    await portFor(sdk).renameCart("cart-1", "Weekly order")

    expect(sdk.updateACart.mock.calls[0]![0]).toMatchObject({
      headers: {
        Authorization: "Bearer implicit-token",
        "EP-Account-Management-Authentication-Token": ACCOUNT_TOKEN,
      },
      path: { cartID: "cart-1" },
      body: { data: { name: "Weekly order" } },
    })
  })

  test("a refused rename is a failure", async () => {
    const sdk = sdkWith({ updateACart: vi.fn(async () => refused(422)) })

    await expect(
      portFor(sdk).renameCart("cart-1", "Weekly order"),
    ).rejects.toThrow(CartsUnavailableError)
  })

  test("a network failure while renaming is a failure", async () => {
    const sdk = sdkWith({ updateACart: networkFailure })

    await expect(
      portFor(sdk).renameCart("cart-1", "Weekly order"),
    ).rejects.toThrow(CartsUnavailableError)
  })
})

describe("deleteCart", () => {
  test("deletes the named cart with both tokens", async () => {
    const sdk = sdkWith()

    await portFor(sdk).deleteCart("cart-1")

    expect(sdk.deleteACart.mock.calls[0]![0]).toMatchObject({
      headers: {
        Authorization: "Bearer implicit-token",
        "EP-Account-Management-Authentication-Token": ACCOUNT_TOKEN,
      },
      path: { cartID: "cart-1" },
    })
  })

  test("keeps the refusal so the shopper can be told why", async () => {
    const sdk = sdkWith({ deleteACart: vi.fn(async () => refused(400)) })

    const failure = await portFor(sdk)
      .deleteCart("cart-1")
      .catch((error: unknown) => error)

    expect(failure).toBeInstanceOf(CartsUnavailableError)
    expect((failure as CartsUnavailableError).cause).toEqual({
      errors: [{ status: 400, title: "refused" }],
    })
  })

  test("a network failure while deleting is a failure", async () => {
    const sdk = sdkWith({ deleteACart: networkFailure })

    await expect(portFor(sdk).deleteCart("cart-1")).rejects.toThrow(
      CartsUnavailableError,
    )
  })
})

describe("disassociateCart", () => {
  test("unlinks the named cart from this account with both tokens", async () => {
    const sdk = sdkWith()

    await portFor(sdk).disassociateCart("cart-1")

    expect(sdk.deleteAccountCartAssociation.mock.calls[0]![0]).toMatchObject({
      headers: {
        Authorization: "Bearer implicit-token",
        "EP-Account-Management-Authentication-Token": ACCOUNT_TOKEN,
      },
      path: { cartID: "cart-1" },
      body: { data: [{ type: "account", id: ACCOUNT_ID }] },
    })
  })

  test("a refused disassociation is a failure", async () => {
    const sdk = sdkWith({
      deleteAccountCartAssociation: vi.fn(async () => refused(403)),
    })

    await expect(portFor(sdk).disassociateCart("cart-1")).rejects.toThrow(
      CartsUnavailableError,
    )
  })

  test("a network failure while disassociating is a failure", async () => {
    const sdk = sdkWith({ deleteAccountCartAssociation: networkFailure })

    await expect(portFor(sdk).disassociateCart("cart-1")).rejects.toThrow(
      CartsUnavailableError,
    )
  })
})

describe("addProduct", () => {
  test("adds one of the product to the named cart", async () => {
    const sdk = sdkWith()

    await portFor(sdk).addProduct("cart-1", "mug")

    expect(sdk.manageCarts.mock.calls[0]![0]).toMatchObject({
      path: { cartID: "cart-1" },
      body: { data: { type: "cart_item", id: "mug", quantity: 1 } },
    })
  })

  test("a refused add is a failure", async () => {
    const sdk = sdkWith({ manageCarts: vi.fn(async () => refused(404)) })

    await expect(portFor(sdk).addProduct("cart-1", "mug")).rejects.toThrow(
      CartsUnavailableError,
    )
  })

  test("a network failure while adding is a failure", async () => {
    const sdk = sdkWith({ manageCarts: networkFailure })

    await expect(portFor(sdk).addProduct("cart-1", "mug")).rejects.toThrow(
      CartsUnavailableError,
    )
  })
})

describe("readCart", () => {
  test("asks for the cart with its items and turns it into a view", async () => {
    const sdk = sdkWith({
      getACart: vi.fn(async () =>
        ok({
          data: {
            id: "cart-1",
            meta: { display_price: { with_tax: { formatted: "$20.00" } } },
          },
          included: {
            items: [
              { id: "line-1", type: "cart_item", name: "Mug", quantity: 2 },
            ],
          },
        }),
      ),
    })

    const view = await portFor(sdk).readCart("cart-1")

    expect(sdk.getACart.mock.calls[0]![0]).toMatchObject({
      path: { cartID: "cart-1" },
      query: { include: ["items"] },
    })
    expect(view.total).toBe("$20.00")
    expect(view.itemCount).toBe(2)
  })

  test("a refused read is a failure, not an empty cart", async () => {
    const sdk = sdkWith({ getACart: vi.fn(async () => refused(500)) })

    await expect(portFor(sdk).readCart("cart-1")).rejects.toThrow(
      CartsUnavailableError,
    )
  })

  test("a network failure while reading is a failure, not an empty cart", async () => {
    const sdk = sdkWith({ getACart: networkFailure })

    await expect(portFor(sdk).readCart("cart-1")).rejects.toThrow(
      CartsUnavailableError,
    )
  })
})
