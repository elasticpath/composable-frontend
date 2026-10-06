import { describe, expect, it } from "vitest"
import {
  zAddTaxItemToCartResponse,
  zPaymentSetupResponse,
  zPutV2SettingsCartBody,
} from "./zod"

describe("read/write split", () => {
  it("keeps the data of a cart tax item response", () => {
    const taxItem = {
      data: {
        id: "4f4e6d37-8c8c-4a1a-b8a3-6cd2efab12de",
        type: "tax_item",
        code: "VAT",
        jurisdiction: "UK",
        name: "Value Added Tax",
        rate: 0.2,
      },
    }

    expect(zAddTaxItemToCartResponse.parse(taxItem)).toEqual(taxItem)
    expect(
      zAddTaxItemToCartResponse.safeParse({
        data: { ...taxItem.data, rate: "0.2" },
      }).success,
    ).toBe(false)
  })

  it("keeps the data of a payment transaction response", () => {
    const transaction = {
      data: {
        id: "0c9a5b4e-9a5d-4bde-9f0e-3a4b1c2d3e4f",
        type: "transaction",
        gateway: "manual",
        transaction_type: "purchase",
        status: "complete",
      },
    }

    expect(zPaymentSetupResponse.parse(transaction)).toEqual(transaction)
    expect(
      zPaymentSetupResponse.safeParse({
        data: { ...transaction.data, status: 1 },
      }).success,
    ).toBe(false)
  })

  it("strips the read-only id from a cart settings request body", () => {
    const parsed = zPutV2SettingsCartBody.parse({
      data: {
        type: "settings",
        id: "15419118-44ce-5343-8ff6-574daf52bc6b",
        cart_expiry_days: 25,
      },
    })

    expect(parsed.data).toEqual({ type: "settings", cart_expiry_days: 25 })
  })
})
