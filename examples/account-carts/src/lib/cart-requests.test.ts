import { describe, expect, test } from "vitest"
import {
  ACCOUNT_TOKEN_HEADER,
  CART_NAME,
  associateCartRequest,
  cartHeaders,
  createCartRequest,
  renameCartRequest,
} from "./cart-requests"

const headers = cartHeaders({
  implicitToken: "implicit-token",
  accountToken: "account-token",
})

describe("cartHeaders", () => {
  test("sends the implicit token as the bearer and the account token in its own header", () => {
    expect(headers).toEqual({
      Authorization: "Bearer implicit-token",
      [ACCOUNT_TOKEN_HEADER]: "account-token",
    })
  })
})

describe("renameCartRequest", () => {
  test("names the cart in the path and sends only the new name", () => {
    expect(
      renameCartRequest({ headers, cartId: "cart-1", name: "Weekly order" }),
    ).toEqual({
      headers,
      path: { cartID: "cart-1" },
      body: { data: { name: "Weekly order" } },
    })
  })
})

describe("createCartRequest", () => {
  test("creates a cart with the default name and the account token", () => {
    expect(createCartRequest({ headers })).toEqual({
      headers,
      body: { data: { name: CART_NAME } },
    })
  })

  test("creates a cart with the name it is given", () => {
    expect(createCartRequest({ headers, name: "Spring" }).body).toEqual({
      data: { name: "Spring" },
    })
  })
})

describe("associateCartRequest", () => {
  test("links the named cart to the account", () => {
    expect(
      associateCartRequest({
        headers,
        cartId: "cart-1",
        accountId: "account-1",
      }),
    ).toEqual({
      headers,
      path: { cartID: "cart-1" },
      body: { data: [{ type: "account", id: "account-1" }] },
    })
  })
})
