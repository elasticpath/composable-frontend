import { describe, expectTypeOf, it } from "vitest"
import { putV2SettingsCart, updateATaxItem } from "./index"
import type {
  AddTaxItemToCartResponse,
  CartsItemsTaxesObject,
  PaymentSetupResponse,
  PutV2SettingsCartData,
  SettingsCart,
  TransactionResponse,
} from "./index"

type SettingsCartBody = NonNullable<PutV2SettingsCartData["body"]>

describe("read/write split", () => {
  it("keeps the data of a cart tax item response", () => {
    expectTypeOf<AddTaxItemToCartResponse>()
      .toHaveProperty("data")
      .toEqualTypeOf<CartsItemsTaxesObject>()
  })

  it("keeps the data of a payment transaction response", () => {
    expectTypeOf<PaymentSetupResponse>()
      .toHaveProperty("data")
      .toEqualTypeOf<TransactionResponse>()
  })

  it("leaves the read-only id out of a cart settings request body", () => {
    expectTypeOf<NonNullable<SettingsCartBody["data"]>>().not.toHaveProperty(
      "id",
    )
  })

  it("refuses a cart settings literal that sends the read-only id", () => {
    putV2SettingsCart({
      body: {
        data: {
          type: "settings",
          // @ts-expect-error
          id: "15419118-44ce-5343-8ff6-574daf52bc6b",
        },
      },
    })
  })

  it("accepts cart settings read from the API as the body", () => {
    const settings: SettingsCart = {
      data: { type: "settings", id: "15419118-44ce-5343-8ff6-574daf52bc6b" },
    }

    putV2SettingsCart({ body: settings })
  })

  it("accepts a tax item read from the API as the body", () => {
    const taxItem: AddTaxItemToCartResponse = {
      data: {
        id: "4f4e6d37-8c8c-4a1a-b8a3-6cd2efab12de",
        type: "tax_item",
        code: "VAT",
        jurisdiction: "UK",
        name: "Value Added Tax",
        rate: 0.2,
      },
    }

    updateATaxItem({
      body: taxItem,
      path: { cartID: "cart", cartitemID: "item", taxitemID: "tax" },
    })
  })

  it("refuses a tax item literal that sends the read-only id", () => {
    updateATaxItem({
      body: {
        data: {
          // @ts-expect-error
          id: "4f4e6d37-8c8c-4a1a-b8a3-6cd2efab12de",
          type: "tax_item",
          name: "Value Added Tax",
          jurisdiction: "UK",
          rate: 0.2,
        },
      },
      path: { cartID: "cart", cartitemID: "item", taxitemID: "tax" },
    })
  })
})
